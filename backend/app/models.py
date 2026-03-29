import os
from datetime import datetime
from werkzeug.security import generate_password_hash
from config import Config
from .utils import get_db


def init_db():
    """Create all tables and insert default admin user."""
    os.makedirs(os.path.dirname(Config.DATABASE_PATH), exist_ok=True)
    conn = get_db()
    cursor = conn.cursor()

    cursor.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            email TEXT,
            avatar TEXT DEFAULT '',
            role TEXT DEFAULT 'user' CHECK(role IN ('admin', 'user')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            sub_category TEXT DEFAULT '',
            price REAL NOT NULL,
            original_price REAL DEFAULT 0,
            sales INTEGER DEFAULT 0,
            monthly_sales INTEGER DEFAULT 0,
            rating REAL DEFAULT 5.0,
            review_count INTEGER DEFAULT 0,
            shop_name TEXT DEFAULT '',
            shop_location TEXT DEFAULT '',
            image_url TEXT DEFAULT '',
            tags TEXT DEFAULT '',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL,
            user_name TEXT DEFAULT '',
            content TEXT NOT NULL,
            sentiment TEXT DEFAULT 'neutral' CHECK(sentiment IN ('positive', 'neutral', 'negative')),
            sentiment_score REAL DEFAULT 0.5,
            rating REAL DEFAULT 5.0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS favorites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
            UNIQUE(user_id, product_id)
        );

        CREATE TABLE IF NOT EXISTS browse_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
        CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
        CREATE INDEX IF NOT EXISTS idx_comments_product_id ON comments(product_id);
        CREATE INDEX IF NOT EXISTS idx_comments_sentiment ON comments(sentiment);
        CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
        CREATE INDEX IF NOT EXISTS idx_browse_history_user_id ON browse_history(user_id);
    """)

    # Insert default admin user if not exists
    cursor.execute("SELECT id FROM users WHERE username = ?", ('admin',))
    if cursor.fetchone() is None:
        cursor.execute(
            "INSERT INTO users (username, password_hash, email, role) VALUES (?, ?, ?, ?)",
            ('admin', generate_password_hash('admin123', method='pbkdf2:sha256'), 'admin@taobao-analyzer.com', 'admin')
        )

    conn.commit()
    conn.close()


def seed_data():
    """当数据库为空时，导入初始采集的商品与评论数据。"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM products")
    count = cursor.fetchone()[0]
    if count > 0:
        conn.close()
        return

    import random

    categories = {
        '个人护理': ['洗发水', '沐浴露', '牙膏', '牙刷', '护肤品', '洗面奶'],
        '家庭清洁': ['洗衣液', '洗洁精', '垃圾袋', '拖把', '抹布', '消毒液'],
        '纸品湿巾': ['抽纸', '卷纸', '湿巾', '厨房用纸', '手帕纸'],
        '衣物护理': ['衣架', '晾衣绳', '防蛀片', '洗衣袋', '除毛器'],
        '厨房用品': ['保鲜膜', '保鲜袋', '锡纸', '厨房手套', '围裙', '砧板'],
        '收纳整理': ['收纳箱', '收纳袋', '衣柜收纳', '桌面收纳', '鞋架'],
        '居家日用': ['拖鞋', '毛巾', '浴巾', '雨伞', '暖水袋', '香薰'],
    }

    locations = ['杭州', '上海', '广州', '深圳', '北京', '义乌', '温州', '苏州', '南京', '成都',
                 '武汉', '长沙', '郑州', '天津', '重庆', '西安', '福州', '厦门', '东莞', '佛山']

    tag_pool = ['热销', '包邮', '新品', '大容量', '家庭装', '经济实惠', '品牌直营',
                '天然成分', '无添加', '环保', '抗菌', '持久留香', '温和不刺激', '国货之光']

    shop_names = ['百洁家居旗舰店', '洁美日化专营店', '优品生活馆', '净享家居用品店', '绿洁日化批发',
                  '好管家日用百货', '舒适家居旗舰店', '品质生活优选', '日用百货直营店', '清新家居专营',
                  '居家优品商城', '净爽日化用品', '美丽家日用品', '洁净生活馆', '家和日用旗舰店']

    title_suffixes = ['家庭装实惠', '大容量超值', '品质升级版', '经典热销款', '清香持久型',
                      '温和不刺激', '天然植物配方', '抑菌除螨', '超值组合装', '新品上市']

    user_names = ['小王', '张三', '李四', '用户A', '买家秀', '淘友', '小红', '小明', '快乐购物',
                  '品质生活', '居家达人', '精明消费者', '日用品爱好者', '回头客', '忠实粉丝']

    extra_phrases = ['，推荐购买', '，物流很快', '，已经回购多次了', '，家人都喜欢', '，很划算',
                     '，下次还来', '，好评！', '，值得信赖', '，朋友推荐的', '，用着不错']

    products_data = []
    for _ in range(200):
        cat = random.choice(list(categories.keys()))
        sub_cat = random.choice(categories[cat])
        price = round(random.uniform(5, 120), 2)
        original_price = round(price * random.uniform(1.1, 2.0), 2)
        sales = random.randint(50, 50000)
        monthly_sales = random.randint(10, min(sales, 8000))
        rating = round(random.uniform(3.5, 5.0), 1)
        review_count = random.randint(10, 5000)
        shop = random.choice(shop_names)
        location = random.choice(locations)
        tags = ','.join(random.sample(tag_pool, random.randint(1, 4)))
        days_ago = random.randint(0, 60)
        created = (datetime.now() - __import__('datetime').timedelta(days=days_ago)).strftime('%Y-%m-%d %H:%M:%S')

        products_data.append((
            f'{sub_cat} {random.choice(title_suffixes)}',
            cat, sub_cat, price, original_price, sales, monthly_sales,
            rating, review_count, shop, location, '', tags, created
        ))

    cursor.executemany(
        """INSERT INTO products
           (title, category, sub_category, price, original_price, sales, monthly_sales,
            rating, review_count, shop_name, shop_location, image_url, tags, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        products_data
    )

    # 导入评论数据
    positive_templates = [
        '质量很好，非常满意！', '包装很精致，物超所值', '用了一段时间了，效果不错',
        '发货速度快，东西很好用', '回购了很多次了，一直很好', '性价比很高，推荐购买',
        '比实体店便宜很多，质量也好', '全家人都在用，很喜欢', '味道清新自然，很好闻',
        '量大实惠，可以用很久',
    ]
    neutral_templates = [
        '一般般吧，凑合用', '还行，和描述差不多', '中规中矩，没什么特别的',
        '还可以，价格也合适', '普通使用没什么问题',
    ]
    negative_templates = [
        '质量一般，不太满意', '和图片有差距', '用了一次就不想用了',
        '价格偏贵，性价比不高', '包装太简陋了',
    ]

    product_ids = list(range(1, len(products_data) + 1))
    comments_data = []
    for pid in product_ids:
        num_comments = random.randint(3, 15)
        for _ in range(num_comments):
            roll = random.random()
            if roll < 0.6:
                sentiment = 'positive'
                content = random.choice(positive_templates) + random.choice(extra_phrases)
                score = round(random.uniform(0.7, 1.0), 2)
                r = round(random.uniform(4.0, 5.0), 1)
            elif roll < 0.85:
                sentiment = 'neutral'
                content = random.choice(neutral_templates) + random.choice(extra_phrases)
                score = round(random.uniform(0.4, 0.6), 2)
                r = round(random.uniform(3.0, 4.0), 1)
            else:
                sentiment = 'negative'
                content = random.choice(negative_templates) + random.choice(extra_phrases)
                score = round(random.uniform(0.0, 0.3), 2)
                r = round(random.uniform(1.0, 3.0), 1)

            days_ago = random.randint(0, 30)
            created = (datetime.now() - __import__('datetime').timedelta(days=days_ago)).strftime('%Y-%m-%d %H:%M:%S')
            comments_data.append((pid, random.choice(user_names), content, sentiment, score, r, created))

    cursor.executemany(
        """INSERT INTO comments (product_id, user_name, content, sentiment, sentiment_score, rating, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)""",
        comments_data
    )

    conn.commit()
    conn.close()
