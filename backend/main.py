from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from prophet import Prophet
import pandas as pd
import requests
import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def fetch_wikipedia_data(topic):
    # Calculate dates: Today and 4 years ago
    end_date = datetime.datetime.now()
    start_date = end_date - datetime.timedelta(days=4*365)
    
    # Format for API: YYYYMMDD
    str_start = start_date.strftime("%Y%m%d")
    str_end = end_date.strftime("%Y%m%d")
    
    # Wikimedia API Endpoint (Free, no key required)
    # We use "User" agent to filter out bots
    url = f"https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/{topic}/daily/{str_start}/{str_end}"
    
    headers = {
        'User-Agent': 'PlotPulseBot/1.0 (contact@example.com)'
    }
    
    response = requests.get(url, headers=headers)
    
    if response.status_code != 200:
        return None
        
    return response.json()

@app.get("/predict/{keyword}")
async def get_prediction(keyword: str):
    print(f"🔍 Searching Wikipedia for: {keyword}")
    
    # 1. FETCH DATA (Try Title Case first, then exact)
    data = fetch_wikipedia_data(keyword.title())
    if not data:
        data = fetch_wikipedia_data(keyword)
        
    if not data:
        raise HTTPException(status_code=404, detail="Topic not found. Try a specific Wikipedia title like 'Bitcoin' or 'Python (programming language)'")

    # 2. PREPARE DATA FOR PROPHET
    try:
        items = data['items']
        df = pd.DataFrame(items)
        
        # Prophet needs 'ds' (date) and 'y' (value)
        df['ds'] = pd.to_datetime(df['timestamp'], format='%Y%m%d00')
        df['y'] = df['views']
        df = df[['ds', 'y']]

        # 3. GENERATE PREDICTION
        m = Prophet(daily_seasonality=False, weekly_seasonality=True, yearly_seasonality=True)
        m.fit(df)
        
        future = m.make_future_dataframe(periods=365)
        forecast = m.predict(future)

        # 4. FORMAT RESPONSE
        result_data = []
        for index, row in forecast.iterrows():
            date_str = row['ds'].strftime('%Y-%m-%d')
            
            actual_val = None
            existing_row = df[df['ds'] == row['ds']]
            if not existing_row.empty:
                actual_val = int(existing_row.iloc[0]['y'])

            result_data.append({
                "date": date_str,
                "Actual Interest": actual_val,
                "Predicted Trend": round(row['yhat'], 1),
                "Lower Bound": round(row['yhat_lower'], 1),
                "Upper Bound": round(row['yhat_upper'], 1)
            })

        current_trend = "Rising" if forecast.iloc[-1]['yhat'] > df.iloc[-1]['y'] else "Falling"
        
        return {
            "keyword": keyword.title(),
            "source": "Wikipedia Pageviews",
            "stats": {
                "peak": int(df['y'].max()),
                "average": int(df['y'].mean()),
                "prediction_trend": current_trend
            },
            "graph_data": result_data
        }

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)