from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from prophet import Prophet
import pandas as pd
import requests
import datetime
import json
import re
from pathlib import Path
from urllib.parse import urlparse

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

HISTORY_PATH = Path(__file__).with_name("price_history.json")

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

def _load_price_history():
    if not HISTORY_PATH.exists():
        return {}
    try:
        return json.loads(HISTORY_PATH.read_text())
    except json.JSONDecodeError:
        return {}

def _save_price_history(history):
    HISTORY_PATH.write_text(json.dumps(history, indent=2))

def _extract_price(text):
    if not text:
        return None
    cleaned = re.sub(r"[₹,]", "", text)
    match = re.search(r"(\d+(?:\.\d+)?)", cleaned)
    if not match:
        return None
    return float(match.group(1))

def _parse_amazon(html):
    title_match = re.search(r'id="productTitle"[^>]*>([^<]+)</', html, re.IGNORECASE)
    title_text = title_match.group(1).strip() if title_match else "Amazon Product"
    price_patterns = [
        r'id="priceblock_ourprice"[^>]*>([^<]+)</',
        r'id="priceblock_dealprice"[^>]*>([^<]+)</',
        r'id="priceblock_saleprice"[^>]*>([^<]+)</',
        r'class="a-price-whole"[^>]*>([^<]+)</',
    ]
    price = None
    for pattern in price_patterns:
        match = re.search(pattern, html, re.IGNORECASE)
        price = _extract_price(match.group(1)) if match else None
        if price:
            break
    return title_text, price

def _parse_flipkart(html):
    title_match = re.search(r'class="B_NuCI"[^>]*>([^<]+)</', html, re.IGNORECASE)
    title_text = title_match.group(1).strip() if title_match else "Flipkart Product"
    price_patterns = [
        r'class="_30jeq3[^"]*"[^>]*>([^<]+)</',
        r'class="_16Jk6d"[^>]*>([^<]+)</',
    ]
    price = None
    for pattern in price_patterns:
        match = re.search(pattern, html, re.IGNORECASE)
        price = _extract_price(match.group(1)) if match else None
        if price:
            break
    return title_text, price

def _infer_site(url):
    host = urlparse(url).netloc.lower()
    if "amazon" in host:
        return "amazon"
    if "flipkart" in host:
        return "flipkart"
    return "unknown"

def _build_forecast(history_points, horizon=6):
    if not history_points:
        return []
    y_values = [point["price"] for point in history_points]
    x_values = list(range(len(y_values)))
    mean_x = sum(x_values) / len(x_values)
    mean_y = sum(y_values) / len(y_values)
    denominator = sum((x - mean_x) ** 2 for x in x_values)
    slope = sum((x - mean_x) * (y - mean_y) for x, y in zip(x_values, y_values)) / denominator if denominator else 0
    intercept = mean_y - slope * mean_x
    forecast = []
    last_date = datetime.datetime.strptime(history_points[-1]["date"], "%Y-%m-%d")
    for i in range(1, horizon + 1):
        future_date = (last_date + datetime.timedelta(days=30 * i)).strftime("%Y-%m-%d")
        prediction = max(0, round(intercept + slope * (len(x_values) + i - 1), 2))
        forecast.append({"date": future_date, "price": prediction})
    return forecast

def _fetch_sales_events(site):
    sources = {
        "amazon": ["https://www.amazon.in/events/greatindianfestival"],
        "flipkart": ["https://www.flipkart.com/big-billion-days-store"],
    }
    events = []
    for url in sources.get(site, []):
        try:
            response = requests.get(
                url,
                headers={
                    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Accept-Language": "en-IN,en;q=0.9",
                },
                timeout=15,
            )
            if response.status_code != 200:
                continue
            title_match = re.search(r"<title[^>]*>(.*?)</title>", response.text, re.IGNORECASE | re.DOTALL)
            page_title = title_match.group(1).strip() if title_match else None
            date_match = re.search(r"(\\b\\w+\\s+\\d{1,2}\\b.*?\\b\\d{1,2}\\b)", response.text)
            if page_title:
                events.append({
                    "name": page_title,
                    "date": date_match.group(1) if date_match else "Date not listed",
                    "source": url,
                })
        except requests.RequestException:
            continue
    return events

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

@app.get("/price-track")
async def get_price_track(url: str):
    site = _infer_site(url)
    if site == "unknown":
        raise HTTPException(status_code=400, detail="Unsupported URL. Please provide an Amazon or Flipkart product link.")

    try:
        response = requests.get(
            url,
            headers={
                "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept-Language": "en-IN,en;q=0.9",
            },
            timeout=20,
        )
    except requests.RequestException as exc:
        raise HTTPException(status_code=502, detail=f"Failed to fetch product page: {exc}") from exc

    if response.status_code != 200:
        raise HTTPException(status_code=502, detail="Failed to fetch product page.")

    if site == "amazon":
        title, price = _parse_amazon(response.text)
    else:
        title, price = _parse_flipkart(response.text)

    if price is None:
        raise HTTPException(status_code=404, detail="Unable to locate price on the product page.")

    history = _load_price_history()
    history_points = history.get(url, [])
    today = datetime.datetime.now().strftime("%Y-%m-%d")
    if not history_points or history_points[-1]["date"] != today:
        history_points.append({"date": today, "price": price})
        history[url] = history_points
        _save_price_history(history)

    forecast = _build_forecast(history_points)
    sales = _fetch_sales_events(site)

    return {
        "product": {
            "title": title,
            "site": site,
            "url": url,
        },
        "currency": "INR",
        "current_price": price,
        "history": history_points,
        "forecast": forecast,
        "sales": sales,
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
