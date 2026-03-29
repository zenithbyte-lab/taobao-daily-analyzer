import re
from collections import Counter
from datetime import datetime, timedelta
from flask import Blueprint, request
from ..utils import get_db, make_response

stats_bp = Blueprint('stats', __name__, url_prefix='/api/stats')


@stats_bp.route('/overview', methods=['GET'])
def stats_overview():
    try:
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("SELECT COUNT(*) FROM products")
        total_products = cursor.fetchone()[0]

        cursor.execute("SELECT AVG(price) FROM products")
        avg_price = round(cursor.fetchone()[0] or 0, 2)

        cursor.execute("SELECT SUM(sales) FROM products")
        total_sales = cursor.fetchone()[0] or 0

        cursor.execute("SELECT COUNT(DISTINCT category) FROM products")
        category_count = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM comments WHERE sentiment = 'positive'")
        positive = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM comments")
        total_comments = cursor.fetchone()[0]
        positive_rate = round(positive / total_comments * 100, 1) if total_comments else 0

        conn.close()
        return make_response(200, data={
            'total_products': total_products,
            'avg_price': avg_price,
            'total_sales': total_sales,
            'category_count': category_count,
            'positive_rate': positive_rate,
            'total_comments': total_comments,
        })
    except Exception as e:
        return make_response(500, message=str(e))


@stats_bp.route('/price-distribution', methods=['GET'])
def stats_price_distribution():
    try:
        conn = get_db()
        cursor = conn.cursor()

        bands = [
            ('0-20', 0, 20),
            ('20-40', 20, 40),
            ('40-60', 40, 60),
            ('60-80', 60, 80),
            ('80+', 80, 999999),
        ]

        result = []
        for label, low, high in bands:
            cursor.execute(
                "SELECT COUNT(*) as count, COALESCE(SUM(sales), 0) as total_sales FROM products WHERE price >= ? AND price < ?",
                (low, high)
            )
            row = cursor.fetchone()

            cursor.execute("""
                SELECT c.sentiment, COUNT(*) as cnt
                FROM comments c
                JOIN products p ON c.product_id = p.id
                WHERE p.price >= ? AND p.price < ?
                GROUP BY c.sentiment
            """, (low, high))
            sentiments = {r['sentiment']: r['cnt'] for r in cursor.fetchall()}

            result.append({
                'range': label,
                'count': row['count'],
                'total_sales': row['total_sales'],
                'positive': sentiments.get('positive', 0),
                'neutral': sentiments.get('neutral', 0),
                'negative': sentiments.get('negative', 0),
            })

        conn.close()
        return make_response(200, data=result)
    except Exception as e:
        return make_response(500, message=str(e))


@stats_bp.route('/category-sales', methods=['GET'])
def stats_category_sales():
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT category,
                   SUM(sales) as total_sales,
                   COUNT(*) as product_count,
                   ROUND(AVG(price), 2) as avg_price,
                   ROUND(AVG(rating), 1) as avg_rating
            FROM products
            GROUP BY category
            ORDER BY total_sales DESC
        """)
        rows = [dict(r) for r in cursor.fetchall()]
        conn.close()
        return make_response(200, data=rows)
    except Exception as e:
        return make_response(500, message=str(e))


@stats_bp.route('/region-heat', methods=['GET'])
def stats_region_heat():
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT shop_location as region,
                   SUM(sales) as total_sales,
                   COUNT(*) as product_count,
                   ROUND(AVG(price), 2) as avg_price
            FROM products
            WHERE shop_location != ''
            GROUP BY shop_location
            ORDER BY total_sales DESC
            LIMIT 20
        """)
        rows = [dict(r) for r in cursor.fetchall()]
        conn.close()
        return make_response(200, data=rows)
    except Exception as e:
        return make_response(500, message=str(e))


@stats_bp.route('/daily-trend', methods=['GET'])
def stats_daily_trend():
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT MAX(DATE(created_at)) FROM products")
        max_date_row = cursor.fetchone()
        max_date_str = max_date_row[0] if max_date_row else None
        today = datetime.strptime(max_date_str, '%Y-%m-%d').date() if max_date_str else datetime.now().date()
        start = today - timedelta(days=29)

        cursor.execute("""
            SELECT DATE(created_at) as date,
                   SUM(sales) as total_sales,
                   COUNT(*) as new_products
            FROM products
            WHERE DATE(created_at) >= ?
            GROUP BY DATE(created_at)
            ORDER BY date
        """, (start.isoformat(),))
        sales_map = {r['date']: {'total_sales': r['total_sales'], 'new_products': r['new_products']}
                     for r in cursor.fetchall()}

        cursor.execute("""
            SELECT DATE(created_at) as date,
                   COUNT(*) as review_count
            FROM comments
            WHERE DATE(created_at) >= ?
            GROUP BY DATE(created_at)
            ORDER BY date
        """, (start.isoformat(),))
        review_map = {r['date']: r['review_count'] for r in cursor.fetchall()}

        conn.close()

        result = []
        for i in range(30):
            d = (start + timedelta(days=i)).isoformat()
            sales_info = sales_map.get(d, {'total_sales': 0, 'new_products': 0})
            result.append({
                'date': d,
                'total_sales': sales_info['total_sales'],
                'new_products': sales_info['new_products'],
                'review_count': review_map.get(d, 0),
            })

        return make_response(200, data=result)
    except Exception as e:
        return make_response(500, message=str(e))


@stats_bp.route('/top-products', methods=['GET'])
def stats_top_products():
    try:
        n = request.args.get('n', 10, type=int)
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, title, category, price, sales, monthly_sales, rating, shop_name, shop_location
            FROM products
            ORDER BY sales DESC
            LIMIT ?
        """, (n,))
        rows = [dict(r) for r in cursor.fetchall()]
        conn.close()
        return make_response(200, data=rows)
    except Exception as e:
        return make_response(500, message=str(e))


@stats_bp.route('/prediction', methods=['GET'])
def stats_prediction():
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT MAX(DATE(created_at)) FROM products")
        max_date_row = cursor.fetchone()
        max_date_str = max_date_row[0] if max_date_row else None
        today = datetime.strptime(max_date_str, '%Y-%m-%d').date() if max_date_str else datetime.now().date()
        start = today - timedelta(days=6)

        cursor.execute("""
            SELECT DATE(created_at) as date, SUM(sales) as total_sales
            FROM products
            WHERE DATE(created_at) >= ?
            GROUP BY DATE(created_at)
            ORDER BY date
        """, (start.isoformat(),))
        actual_map = {r['date']: r['total_sales'] for r in cursor.fetchall()}
        conn.close()

        actual_data = []
        values = []
        for i in range(7):
            d = (start + timedelta(days=i)).isoformat()
            val = actual_map.get(d, 0)
            actual_data.append({'date': d, 'sales': val, 'type': 'actual'})
            values.append(val)

        n = len(values)
        if n >= 2 and sum(values) > 0:
            x_mean = (n - 1) / 2
            y_mean = sum(values) / n
            numerator = sum((i - x_mean) * (v - y_mean) for i, v in enumerate(values))
            denominator = sum((i - x_mean) ** 2 for i in range(n))
            slope = numerator / denominator if denominator != 0 else 0
            intercept = y_mean - slope * x_mean

            predicted_data = []
            for j in range(1, 3):
                d = (today + timedelta(days=j)).isoformat()
                pred = max(0, int(intercept + slope * (n - 1 + j)))
                predicted_data.append({'date': d, 'sales': pred, 'type': 'predicted'})
        else:
            predicted_data = [
                {'date': (today + timedelta(days=1)).isoformat(), 'sales': 0, 'type': 'predicted'},
                {'date': (today + timedelta(days=2)).isoformat(), 'sales': 0, 'type': 'predicted'},
            ]

        return make_response(200, data=actual_data + predicted_data)
    except Exception as e:
        return make_response(500, message=str(e))


@stats_bp.route('/keyword-cloud', methods=['GET'])
def stats_keyword_cloud():
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT content FROM comments")
        rows = cursor.fetchall()
        conn.close()

        stop_words = {'\u7684', '\u4e86', '\u662f', '\u5728', '\u6211', '\u6709', '\u548c', '\u5c31', '\u4e0d', '\u4eba', '\u90fd',
                      '\u4e00', '\u4e00\u4e2a', '\u4e0a', '\u4e5f', '\u5f88', '\u5230', '\u8bf4', '\u8981', '\u53bb', '\u4f60', '\u4f1a',
                      '\u7740', '\u6ca1\u6709', '\u770b', '\u597d', '\u81ea\u5df1', '\u8fd9', '\u4ed6', '\u5979', '\u5b83', '\u4eec',
                      '\u90a3', '\u4e9b', '\u4ec0\u4e48', '\u600e\u4e48', '\u5427', '\u5417', '\u5462', '\u554a', '\u54e6', '\u55ef',
                      '\u8fd8', '\u628a', '\u88ab', '\u8ba9', '\u7ed9', '\u4ece', '\u4f46', '\u53ef\u4ee5', '\u8fd9\u4e2a', '\u90a3\u4e2a'}

        counter = Counter()
        for row in rows:
            content = row['content']
            words = re.findall(r'[\u4e00-\u9fff]{2,4}', content)
            for w in words:
                if w not in stop_words:
                    counter[w] += 1

        top_keywords = counter.most_common(80)
        result = [{'keyword': k, 'count': c} for k, c in top_keywords]

        return make_response(200, data=result)
    except Exception as e:
        return make_response(500, message=str(e))
