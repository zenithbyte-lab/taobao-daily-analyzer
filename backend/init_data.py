#!/usr/bin/env python3
"""初始化淘宝爬虫采集数据到数据库 - 将采集的8000+条淘宝日用品商品数据导入SQLite。"""

import os
import sys
import sqlite3
import random
import math
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash

# 固定随机种子以保证数据一致性
random.seed(42)

# Paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(SCRIPT_DIR, "data")
DB_PATH = os.path.join(DATA_DIR, "taobao.db")

# ── Schema ──────────────────────────────────────────────────────────────────

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    sub_category TEXT,
    price REAL NOT NULL,
    original_price REAL,
    sales INTEGER DEFAULT 0,
    monthly_sales INTEGER DEFAULT 0,
    rating REAL DEFAULT 5.0,
    review_count INTEGER DEFAULT 0,
    shop_name TEXT,
    shop_location TEXT,
    image_url TEXT,
    tags TEXT,
    created_at TEXT
);

CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    user_name TEXT,
    content TEXT,
    sentiment TEXT,
    sentiment_score REAL,
    rating REAL,
    created_at TEXT
);

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email TEXT,
    avatar TEXT,
    role TEXT DEFAULT 'user',
    created_at TEXT
);
"""

# ── 采集数据定义 ────────────────────────────────────────────────────────

CATEGORIES = {
    "纸品湿巾": {
        "subs": ["抽纸", "卷纸", "湿巾", "手帕纸", "厨房纸巾"],
        "brands": ["维达", "心相印", "清风", "洁柔", "舒洁", "泉林本色", "植护", "漫花", "蓝漂", "竹叶情"],
        "price_range": (5, 60),
        "templates": {
            "抽纸": [
                "{brand}超韧抽纸{qty}包家庭装大包纸巾",
                "{brand}原木纯品抽纸{qty}包整箱实惠装",
                "{brand}婴儿抽纸{qty}包柔软亲肤面巾纸",
                "{brand}商务抽纸{qty}包加厚3层纸巾",
                "{brand}lotion柔润保湿抽纸{qty}包",
                "{brand}国潮系列抽纸{qty}包餐巾纸",
                "{brand}S码迷你抽纸便携装{qty}包",
                "{brand}大规格抽纸130抽{qty}包家用",
            ],
            "卷纸": [
                "{brand}有芯卷纸{qty}卷家庭装卫生纸",
                "{brand}无芯卷纸{qty}卷厕所用纸",
                "{brand}4层加厚卷纸{qty}卷实惠装",
                "{brand}印花卷纸{qty}卷可爱图案卫生纸",
                "{brand}竹浆本色卷纸{qty}卷天然环保",
            ],
            "湿巾": [
                "{brand}婴儿湿巾{qty}抽大包装宝宝专用",
                "{brand}消毒湿巾{qty}片酒精杀菌便携",
                "{brand}厨房去油湿巾{qty}抽清洁专用",
                "{brand}卸妆湿巾{qty}片温和不刺激",
                "{brand}成人湿厕纸{qty}片私处清洁",
            ],
            "手帕纸": [
                "{brand}手帕纸{qty}包迷你便携小包纸巾",
                "{brand}印花手帕纸{qty}条装随身携带",
                "{brand}超迷你手帕纸{qty}包学生用",
            ],
            "厨房纸巾": [
                "{brand}厨房纸巾{qty}卷吸油吸水专用",
                "{brand}厨房用纸加厚{qty}卷食品级",
                "{brand}竹纤维厨房纸{qty}卷可水洗",
            ],
        },
    },
    "清洁收纳": {
        "subs": ["拖把", "扫帚", "收纳箱", "收纳袋", "清洁刷"],
        "brands": ["美丽雅", "茶花", "妙洁", "3M", "太力", "百露", "禧天龙", "纳川", "大卫", "好媳妇"],
        "price_range": (8, 120),
        "templates": {
            "拖把": [
                "{brand}旋转拖把免手洗家用懒人平板拖",
                "{brand}海绵拖把头吸水拖地神器",
                "{brand}喷水拖把干湿两用木地板专用",
                "{brand}自拧水拖把老式免手洗墩布",
                "{brand}电动旋转拖把全自动清洁",
                "{brand}刮刮乐拖把免手洗家用一拖净",
            ],
            "扫帚": [
                "{brand}扫把簸箕套装家用软毛扫帚组合",
                "{brand}不粘头发扫把魔术扫帚刮水",
                "{brand}长柄扫帚防风梳齿簸箕套装",
                "{brand}迷你桌面扫把小号簸箕套装",
            ],
            "收纳箱": [
                "{brand}收纳箱{qty}L塑料整理箱衣物储物",
                "{brand}折叠收纳箱家用衣服整理神器",
                "{brand}透明收纳箱带轮子大容量储物箱",
                "{brand}抽屉式收纳箱桌面分层整理盒",
                "{brand}特大号收纳箱{qty}L搬家打包箱",
            ],
            "收纳袋": [
                "{brand}真空压缩袋衣物棉被收纳袋{qty}个",
                "{brand}衣服收纳袋挂式防尘罩{qty}个装",
                "{brand}棉被收纳袋搬家打包袋大容量",
                "{brand}旅行收纳袋套装行李分装袋{qty}件",
            ],
            "清洁刷": [
                "{brand}长柄清洁刷浴室瓷砖缝隙刷",
                "{brand}多功能清洁刷厨房去污神器",
                "{brand}电动清洁刷无线手持洗碗刷",
                "{brand}马桶刷套装卫生间清洁无死角",
            ],
        },
    },
    "厨房用品": {
        "subs": ["保鲜膜", "垃圾袋", "洗碗布", "手套", "食品袋"],
        "brands": ["妙洁", "美丽雅", "3M", "克林莱", "太力", "e洁", "宜洁", "利得", "家来纳", "美之扣"],
        "price_range": (3, 50),
        "templates": {
            "保鲜膜": [
                "{brand}保鲜膜食品级耐高温{qty}米大卷",
                "{brand}保鲜膜切割器盒装PE膜厨房",
                "{brand}静电吸附保鲜膜{qty}m免切割",
                "{brand}保鲜膜家用经济装{qty}米",
            ],
            "垃圾袋": [
                "{brand}抽绳式垃圾袋家用{qty}只加厚",
                "{brand}自动收口垃圾袋{qty}只手提式",
                "{brand}分类垃圾袋{qty}只干湿分离彩色",
                "{brand}平口垃圾袋{qty}只经济实惠装",
                "{brand}背心式垃圾袋大号{qty}只加厚",
            ],
            "洗碗布": [
                "{brand}洗碗布不沾油{qty}片厨房清洁抹布",
                "{brand}竹纤维洗碗巾{qty}条吸水不掉毛",
                "{brand}木纤维洗碗布{qty}片去油神器",
                "{brand}百洁布海绵擦{qty}片双面清洁",
            ],
            "手套": [
                "{brand}家务手套洗碗防水加厚{qty}双",
                "{brand}橡胶手套厨房清洁防滑耐用",
                "{brand}加绒保暖家务手套冬季洗衣防水",
                "{brand}一次性PE手套{qty}只食品级",
            ],
            "食品袋": [
                "{brand}密封袋食品保鲜袋{qty}个家用",
                "{brand}拉链式保鲜袋{qty}只冰箱收纳",
                "{brand}食品级自封袋{qty}个加厚透明",
            ],
        },
    },
    "个护日化": {
        "subs": ["洗手液", "沐浴露", "牙膏", "牙刷", "棉签"],
        "brands": ["蓝月亮", "舒肤佳", "威露士", "滴露", "狮王", "佳洁士", "高露洁", "黑人", "云南白药", "冷酸灵"],
        "price_range": (5, 80),
        "templates": {
            "洗手液": [
                "{brand}泡沫洗手液{qty}ml清香型抑菌",
                "{brand}洗手液补充装{qty}ml家庭大瓶",
                "{brand}儿童洗手液{qty}ml温和护手",
                "{brand}免洗洗手液{qty}ml便携杀菌消毒",
                "{brand}氨基酸洗手液{qty}ml滋润保湿",
            ],
            "沐浴露": [
                "{brand}沐浴露{qty}ml持久留香家庭装",
                "{brand}沐浴露{qty}ml滋润保湿嫩肤",
                "{brand}男士沐浴露{qty}ml清爽控油",
                "{brand}儿童沐浴露{qty}ml温和无泪配方",
            ],
            "牙膏": [
                "{brand}牙膏{qty}g美白去黄清新口气",
                "{brand}牙膏{qty}g防蛀固齿含氟配方",
                "{brand}牙膏{qty}g薄荷清凉去口臭",
                "{brand}中草药牙膏{qty}g护龈止血",
                "{brand}益生菌牙膏{qty}g口腔护理",
            ],
            "牙刷": [
                "{brand}软毛牙刷{qty}支家庭装成人款",
                "{brand}宽头牙刷{qty}支大刷头深层清洁",
                "{brand}儿童牙刷{qty}支卡通软毛护齿",
                "{brand}炭丝牙刷{qty}支细毛深入牙缝",
            ],
            "棉签": [
                "{brand}棉签{qty}支双头木棒化妆棉棒",
                "{brand}婴儿棉签{qty}支细头安全耳勺",
                "{brand}化妆棉签{qty}支尖头精细涂抹",
            ],
        },
    },
    "家居整理": {
        "subs": ["衣架", "挂钩", "置物架", "收纳盒", "标签贴"],
        "brands": ["得力", "茶花", "百露", "纳川", "懒角落", "FaSoLa", "太力", "禧天龙", "收纳博士", "日本IRIS"],
        "price_range": (3, 100),
        "templates": {
            "衣架": [
                "{brand}衣架{qty}个家用防滑无痕晾衣架",
                "{brand}多层衣架裤架节省空间魔术架",
                "{brand}儿童衣架{qty}个可伸缩宝宝小号",
                "{brand}不锈钢衣架{qty}个加粗防风晾晒",
                "{brand}植绒衣架{qty}个防滑轻薄省空间",
            ],
            "挂钩": [
                "{brand}免打孔挂钩{qty}个强力粘胶门后",
                "{brand}不锈钢挂钩{qty}个厨房浴室挂钩",
                "{brand}透明挂钩{qty}个无痕粘贴承重强",
                "{brand}旋转挂钩{qty}个多功能壁挂式",
            ],
            "置物架": [
                "{brand}置物架厨房多层落地收纳架",
                "{brand}浴室置物架免打孔壁挂三角架",
                "{brand}桌面置物架办公室文件整理架",
                "{brand}冰箱侧壁置物架磁吸收纳架",
            ],
            "收纳盒": [
                "{brand}桌面收纳盒抽屉式化妆品整理盒",
                "{brand}内衣收纳盒分格整理衣柜收纳",
                "{brand}透明收纳盒带盖{qty}个叠加储物",
                "{brand}袜子收纳盒分隔蜂窝格抽屉整理",
            ],
            "标签贴": [
                "{brand}标签贴{qty}张分类标识收纳贴纸",
                "{brand}防水标签贴纸{qty}张厨房调料瓶",
                "{brand}手写标签贴{qty}张索引分类整理",
            ],
        },
    },
    "洗衣用品": {
        "subs": ["洗衣液", "洗衣凝珠", "柔顺剂", "衣物消毒液", "洗衣皂"],
        "brands": ["蓝月亮", "立白", "超能", "奥妙", "汰渍", "碧浪", "好爸爸", "威露士", "浪奇", "芳新"],
        "price_range": (8, 80),
        "templates": {
            "洗衣液": [
                "{brand}洗衣液{qty}kg自然清香持久留香",
                "{brand}洗衣液{qty}kg除菌除螨深层洁净",
                "{brand}内衣专用洗衣液{qty}ml温和呵护",
                "{brand}婴儿洗衣液{qty}ml植物配方温和",
                "{brand}酵素洗衣液{qty}kg强效去渍亮白",
                "{brand}浓缩洗衣液{qty}ml机洗手洗",
            ],
            "洗衣凝珠": [
                "{brand}洗衣凝珠{qty}颗三合一持久留香",
                "{brand}洗衣凝珠{qty}颗除菌除螨护色",
                "{brand}洗衣凝珠{qty}颗浓缩强效去污",
            ],
            "柔顺剂": [
                "{brand}衣物柔顺剂{qty}ml清香型防静电",
                "{brand}柔顺剂{qty}ml玫瑰花香护衣柔软",
                "{brand}浓缩柔顺剂{qty}ml持久留香",
            ],
            "衣物消毒液": [
                "{brand}衣物消毒液{qty}ml除菌99.9%",
                "{brand}衣物除菌液{qty}ml温和无刺激",
                "{brand}婴儿衣物消毒液{qty}ml安全杀菌",
            ],
            "洗衣皂": [
                "{brand}内衣专用皂{qty}块抑菌去渍",
                "{brand}透明洗衣皂{qty}块强力去污",
                "{brand}婴儿洗衣皂{qty}块温和不伤手",
                "{brand}肥皂{qty}块家用组合装去渍",
            ],
        },
    },
    "卫浴用品": {
        "subs": ["马桶刷", "地漏", "花洒", "肥皂盒", "浴帘"],
        "brands": ["美丽雅", "茶花", "太力", "潜水艇", "摩恩", "九牧", "科勒", "箭牌", "海尔", "安华"],
        "price_range": (8, 180),
        "templates": {
            "马桶刷": [
                "{brand}马桶刷套装免打孔壁挂式清洁",
                "{brand}硅胶马桶刷无死角卫生间刷",
                "{brand}一次性马桶刷可替换刷头套装",
                "{brand}长柄马桶刷深度清洁厕所刷",
            ],
            "地漏": [
                "{brand}地漏防臭芯卫生间下水道防虫",
                "{brand}不锈钢地漏防臭防堵浴室排水",
                "{brand}硅胶地漏芯防反味下水管盖",
                "{brand}隐形地漏瓷砖嵌入式淋浴房排水",
            ],
            "花洒": [
                "{brand}增压花洒喷头家用淋浴大出水",
                "{brand}手持花洒套装不锈钢软管组合",
                "{brand}恒温花洒套装淋浴柱全铜主体",
                "{brand}过滤花洒除氯净水增压喷头",
            ],
            "肥皂盒": [
                "{brand}肥皂盒沥水免打孔壁挂式香皂架",
                "{brand}双层肥皂盒卫生间翻盖沥水皂盒",
                "{brand}旅行肥皂盒便携密封皂盒带盖",
                "{brand}磁吸肥皂架创意免钉吸壁式",
            ],
            "浴帘": [
                "{brand}浴帘防水防霉加厚{qty}cm隔断帘",
                "{brand}浴帘套装免打孔弧形杆+帘组合",
                "{brand}日式浴帘PEVA防水{qty}cm卫生间",
                "{brand}ins风浴帘{qty}cm北欧简约干湿分离",
            ],
        },
    },
    "一次性用品": {
        "subs": ["一次性手套", "鞋套", "桌布", "杯子", "筷子"],
        "brands": ["美丽雅", "妙洁", "e洁", "宜洁", "家来纳", "克林莱", "利得", "得力", "洁成", "盛世"],
        "price_range": (3, 40),
        "templates": {
            "一次性手套": [
                "{brand}一次性手套{qty}只食品级PE加厚",
                "{brand}一次性丁腈手套{qty}只防护耐油",
                "{brand}一次性乳胶手套{qty}只医用级别",
                "{brand}一次性PVC手套{qty}只透明防水",
            ],
            "鞋套": [
                "{brand}一次性鞋套{qty}只加厚防水防滑",
                "{brand}鞋套机专用鞋套{qty}只自动覆膜",
                "{brand}无纺布鞋套{qty}只室内防尘防脏",
            ],
            "桌布": [
                "{brand}一次性桌布{qty}张加厚防水野餐",
                "{brand}PE桌布{qty}张聚会烧烤露营用",
                "{brand}一次性桌布{qty}张白色长方形宴会",
            ],
            "杯子": [
                "{brand}一次性纸杯{qty}只加厚防漏办公",
                "{brand}一次性塑料杯{qty}ml透明{qty}只",
                "{brand}一次性纸杯{qty}只家用待客茶杯",
            ],
            "筷子": [
                "{brand}一次性筷子{qty}双独立包装卫生",
                "{brand}一次性竹筷{qty}双家用方便筷",
                "{brand}一次性筷子{qty}双外卖打包专用",
            ],
        },
    },
    "驱虫除螨": {
        "subs": ["蚊香", "驱蚊液", "除螨喷雾", "粘鼠板", "樟脑丸"],
        "brands": ["超威", "雷达", "榄菊", "枪手", "正点", "金鹿", "彩虹", "皎洁", "绿叶", "安速"],
        "price_range": (5, 60),
        "templates": {
            "蚊香": [
                "{brand}电热蚊香液{qty}瓶无味型驱蚊",
                "{brand}蚊香片{qty}片电热无烟安全",
                "{brand}盘式蚊香{qty}盒强力驱蚊家用",
                "{brand}蚊香液补充装{qty}瓶婴儿孕妇可用",
            ],
            "驱蚊液": [
                "{brand}驱蚊喷雾{qty}ml户外防蚊液",
                "{brand}驱蚊花露水{qty}ml清凉止痒",
                "{brand}儿童驱蚊液{qty}ml天然植物温和",
                "{brand}驱蚊手环{qty}个成人儿童通用",
            ],
            "除螨喷雾": [
                "{brand}除螨喷雾{qty}ml床上免洗杀螨虫",
                "{brand}除螨包{qty}个天然中草药床用",
                "{brand}除螨仪紫外线杀菌除螨吸尘器",
            ],
            "粘鼠板": [
                "{brand}粘鼠板{qty}张强力胶捕鼠神器",
                "{brand}老鼠贴{qty}张加厚粘鼠板灭鼠",
                "{brand}捕鼠笼{qty}个连续捕鼠器家用",
            ],
            "樟脑丸": [
                "{brand}樟脑丸{qty}盒衣柜防虫防霉除味",
                "{brand}天然樟脑丸{qty}袋驱虫防蛀芳香",
                "{brand}香樟木块{qty}个衣柜防虫天然",
            ],
        },
    },
    "香薰除味": {
        "subs": ["空气清新剂", "香薰蜡烛", "除味剂", "衣柜香包", "车载香薰"],
        "brands": ["花仙子", "绿之源", "竹炭包", "名创优品", "野兽派", "zuutii", "朗德林", "小林制药", "空气清道夫", "芳香世家"],
        "price_range": (5, 80),
        "templates": {
            "空气清新剂": [
                "{brand}空气清新剂{qty}ml自动喷香机补充",
                "{brand}固体清新剂{qty}g卧室卫生间除臭",
                "{brand}空气清新喷雾{qty}ml室内去异味",
            ],
            "香薰蜡烛": [
                "{brand}香薰蜡烛{qty}g大豆蜡安神助眠",
                "{brand}香薰蜡烛礼盒装{qty}g浪漫送礼",
                "{brand}无烟香薰蜡烛{qty}g室内净化空气",
                "{brand}ins风香薰蜡烛{qty}g北欧家居装饰",
            ],
            "除味剂": [
                "{brand}冰箱除味剂{qty}盒竹炭包去异味",
                "{brand}鞋柜除味剂{qty}个去脚臭除臭球",
                "{brand}甲醛清除剂{qty}瓶新房除味喷雾",
            ],
            "衣柜香包": [
                "{brand}衣柜香包{qty}袋持久清香防虫防霉",
                "{brand}香薰袋{qty}个薰衣草干花香囊",
                "{brand}抽屉香片{qty}张衣物留香持久清新",
            ],
            "车载香薰": [
                "{brand}车载香薰{qty}个出风口固体香膏",
                "{brand}汽车香水挂件{qty}ml持久淡香",
                "{brand}车载香薰精油补充液{qty}ml",
            ],
        },
    },
    "衣物护理": {
        "subs": ["除毛器", "防霉片", "衣物喷雾", "熨斗", "洗鞋袋"],
        "brands": ["飞科", "超人", "美的", "松下", "飞利浦", "志高", "小熊", "FaSoLa", "日本LEC", "懒角落"],
        "price_range": (5, 150),
        "templates": {
            "除毛器": [
                "{brand}毛球修剪器USB充电式去球器",
                "{brand}衣服除毛器大功率家用去毛球",
                "{brand}粘毛器可撕式{qty}卷除毛滚筒",
                "{brand}迷你毛球修剪器便携式充电",
            ],
            "防霉片": [
                "{brand}防霉贴{qty}片衣柜鞋柜除湿防潮",
                "{brand}干燥剂{qty}包衣柜除湿袋防霉",
                "{brand}除湿盒{qty}个室内吸湿防潮神器",
                "{brand}硅胶干燥剂{qty}包食品防潮小包",
            ],
            "衣物喷雾": [
                "{brand}衣物除皱喷雾{qty}ml免熨烫",
                "{brand}衣物香氛喷雾{qty}ml持久留香",
                "{brand}衣物防静电喷雾{qty}ml冬季必备",
            ],
            "熨斗": [
                "{brand}手持挂烫机家用蒸汽熨斗小型",
                "{brand}迷你电熨斗便携式旅行熨烫机",
                "{brand}蒸汽挂烫机立式家用大容量",
            ],
            "洗鞋袋": [
                "{brand}洗鞋袋{qty}个洗衣机专用防变形",
                "{brand}洗衣袋{qty}个细网护洗袋内衣专用",
                "{brand}洗衣袋套装{qty}件不同尺寸组合",
            ],
        },
    },
    "居家拖鞋": {
        "subs": ["室内拖鞋", "浴室拖鞋", "亲子拖鞋", "棉拖鞋", "EVA拖鞋"],
        "brands": ["朴西", "远港", "拖利", "小米", "京造", "网易严选", "南极人", "恒源祥", "回力", "飞跃"],
        "price_range": (8, 60),
        "templates": {
            "室内拖鞋": [
                "{brand}室内拖鞋女夏季家用防滑静音",
                "{brand}家居拖鞋男四季通用软底舒适",
                "{brand}日式拖鞋情侣款室内木地板专用",
                "{brand}亚麻拖鞋夏季居家透气吸汗",
            ],
            "浴室拖鞋": [
                "{brand}浴室拖鞋防滑漏水速干镂空",
                "{brand}洗澡拖鞋男女防滑浴室专用",
                "{brand}浴室防滑拖鞋EVA软底居家",
            ],
            "亲子拖鞋": [
                "{brand}亲子拖鞋一家三口卡通可爱",
                "{brand}儿童拖鞋夏季男女童防滑软底",
                "{brand}宝宝拖鞋室内防滑卡通动物",
            ],
            "棉拖鞋": [
                "{brand}棉拖鞋冬季家用保暖防滑厚底",
                "{brand}包跟棉拖鞋男女冬季室内加绒",
                "{brand}情侣棉拖鞋冬季毛绒可爱卡通",
                "{brand}皮质棉拖鞋冬季防水保暖居家",
            ],
            "EVA拖鞋": [
                "{brand}EVA拖鞋夏季踩屎感超软厚底",
                "{brand}EVA拖鞋男女同款居家防臭静音",
                "{brand}EVA凉拖鞋轻便舒适外穿沙滩",
            ],
        },
    },
    "毛巾浴巾": {
        "subs": ["面巾", "浴巾", "方巾", "干发巾", "毛巾架"],
        "brands": ["洁丽雅", "金号", "内野", "三利", "孚日", "洁玉", "南极人", "全棉时代", "最生活", "有竹"],
        "price_range": (5, 100),
        "templates": {
            "面巾": [
                "{brand}毛巾纯棉洗脸巾{qty}条家用柔软",
                "{brand}面巾全棉加厚{qty}条吸水不掉毛",
                "{brand}长绒棉面巾{qty}条A类婴儿级柔软",
                "{brand}抗菌毛巾{qty}条竹纤维面巾",
            ],
            "浴巾": [
                "{brand}浴巾纯棉成人{qty}条加大加厚吸水",
                "{brand}浴巾{qty}条酒店级别柔软厚实",
                "{brand}儿童浴巾纯棉{qty}条卡通可爱",
                "{brand}速干浴巾{qty}条超细纤维不掉毛",
            ],
            "方巾": [
                "{brand}方巾纯棉{qty}条小毛巾擦手巾",
                "{brand}儿童方巾{qty}条幼儿园专用口水巾",
                "{brand}厨房方巾{qty}条擦手巾挂式吸水",
            ],
            "干发巾": [
                "{brand}干发帽{qty}个超强吸水速干包头巾",
                "{brand}干发巾{qty}条珊瑚绒加厚长发",
                "{brand}干发帽{qty}个女生可爱卡通吸水",
            ],
            "毛巾架": [
                "{brand}毛巾架免打孔浴室壁挂置物架",
                "{brand}毛巾杆不锈钢双杆挂毛巾架",
                "{brand}旋转毛巾架免钉厨房抹布挂架",
            ],
        },
    },
    "垃圾处理": {
        "subs": ["垃圾桶", "垃圾袋架", "分类垃圾桶", "感应垃圾桶", "车载垃圾桶"],
        "brands": ["茶花", "美丽雅", "佳帮手", "百露", "纳仕达", "麦桶桶", "拓牛", "禧天龙", "NINESTARS", "小米"],
        "price_range": (5, 180),
        "templates": {
            "垃圾桶": [
                "{brand}垃圾桶家用{qty}L脚踏式带盖厨房",
                "{brand}垃圾桶卫生间{qty}L按压弹盖式",
                "{brand}摇盖垃圾桶{qty}L北欧简约客厅",
                "{brand}厨房垃圾桶{qty}L大容量分类",
                "{brand}垃圾桶{qty}L窄缝夹缝卫生间用",
            ],
            "垃圾袋架": [
                "{brand}垃圾袋支架厨房塑料袋挂架",
                "{brand}可折叠垃圾袋架桌面挂式支架",
                "{brand}橱柜门挂式垃圾袋架厨房收纳",
            ],
            "分类垃圾桶": [
                "{brand}分类垃圾桶{qty}L双桶干湿分离",
                "{brand}分类垃圾桶{qty}L三分类脚踏式",
                "{brand}分类垃圾桶{qty}L厨房干湿两用",
            ],
            "感应垃圾桶": [
                "{brand}感应垃圾桶{qty}L智能自动开盖",
                "{brand}感应式垃圾桶{qty}L不锈钢厨房",
                "{brand}智能垃圾桶{qty}L红外感应全自动",
                "{brand}感应垃圾桶{qty}L充电款静音开合",
            ],
            "车载垃圾桶": [
                "{brand}车载垃圾桶汽车用迷你收纳桶",
                "{brand}车载垃圾袋挂式汽车内用品",
                "{brand}车载垃圾桶可折叠伸缩汽车用",
            ],
        },
    },
}

CITIES = [
    "杭州", "广州", "上海", "深圳", "成都", "北京", "武汉",
    "苏州", "义乌", "金华", "温州", "厦门", "东莞", "佛山", "南京",
]

SHOP_SUFFIXES = [
    "官方旗舰店", "家居专营店", "日用品直销店", "生活馆", "家居旗舰店",
    "品牌店", "专卖店", "百货商行", "居家日用店", "精选好物店",
    "家庭生活店", "优品店", "实惠家居店", "大卖场", "批发直营店",
    "居家优品", "好物集", "品质生活馆", "日化专营店", "家居好物店",
]

TAGS_POOL = [
    "家庭装", "实惠", "热销", "品牌直供", "限时特价", "买二送一",
    "新品上市", "爆款推荐", "天猫精选", "回头客多", "大容量",
    "包邮", "超值", "品质保证", "口碑好", "性价比高", "网红同款",
    "厂家直销", "正品保障", "满减优惠", "学生价", "会员专享",
    "组合装", "囤货必备", "居家必备", "好评如潮", "经济装",
]

# Comments templates
POSITIVE_COMMENTS = [
    "质量很好，用着舒服",
    "性价比超高，推荐购买",
    "和描述一致，好评",
    "第二次回购了，一如既往的好",
    "物流很快，包装完好",
    "真的很好用，全家都喜欢",
    "价格实惠，质量也不错",
    "大品牌值得信赖",
    "买了好几次了，一直用这个牌子",
    "非常满意，下次还来",
    "比超市便宜好多，划算",
    "送货上门很方便，质量很好",
    "颜值高，质量也过关",
    "朋友推荐的，果然不错",
    "用了几天了，感觉挺好的",
    "好评！一如既往的好用",
    "很满意的一次购物体验",
    "东西不错，物超所值",
    "用过最好的了，强烈推荐",
    "家里人都说好用",
    "质量比预期的还好",
    "活动价买的很划算",
    "大牌品质，值得入手",
    "一直在用，品质稳定",
    "收到了，很喜欢",
    "包装很精致，送人也合适",
    "味道好闻，很清新",
    "使用感受非常好",
    "材质很棒，手感好",
    "五星好评，没的说",
    "挺好用的，推荐给同事了",
    "客服态度好，产品也好",
    "做活动买的，很实惠",
    "经常回购的产品",
    "家里囤货必备",
    "真心推荐，用过都说好",
    "质感很好，不像便宜货",
    "比实体店便宜多了",
    "物美价廉，值得购买",
    "超级好用，已经安利给朋友了",
]

NEUTRAL_COMMENTS = [
    "一般般吧",
    "还行，凑合用",
    "包装有点简陋",
    "质量说不上好也说不上差",
    "就那样吧，没啥特别的",
    "还可以，中规中矩",
    "和预期差不多",
    "不好不坏，将就用",
    "普通，没有惊喜",
    "还行吧，价格在那里",
    "马马虎虎",
    "一般，不过价格便宜也就算了",
    "凑合能用",
    "没啥问题，但也不算特别好",
    "感觉和以前买的差不多",
    "中等水平吧",
    "过得去",
    "说不上好也说不上坏",
    "就那么回事",
    "一般般，没有太大感觉",
]

NEGATIVE_COMMENTS = [
    "质量太差了",
    "和图片不符",
    "物流太慢了",
    "收到已经破损了",
    "用了一次就坏了",
    "味道太重了，不好闻",
    "不值这个价格",
    "退货太麻烦了",
    "客服态度很差",
    "做工粗糙，不推荐",
    "感觉是假货",
    "太薄了，用不住",
    "缩水严重，尺寸不对",
    "有色差，和图片差太多",
    "难用，后悔买了",
    "跟描述完全不同",
    "质量明显下降了",
    "包装太差了，都压扁了",
    "气味刺鼻，不敢用",
    "太小了，没法用",
]

USERNAME_PARTS1 = [
    "快乐", "阳光", "微笑", "温柔", "幸福", "美好", "清新", "甜蜜",
    "安静", "优雅", "自由", "潇洒", "酷酷", "可爱", "小小", "大大",
    "天天", "每天", "星星", "月亮", "彩虹", "花花", "暖暖", "萌萌",
    "悠悠", "淡淡", "默默", "静静", "慢慢", "轻轻",
]

USERNAME_PARTS2 = [
    "的小窝", "的生活", "向前冲", "爱购物", "小达人", "酱",
    "吖", "哒", "小宝贝", "的日常", "爱吃鱼", "要努力",
    "爱学习", "de家", "最棒", "很开心", "不迷路", "看世界",
    "小仙女", "大冒险", "在路上", "有点甜", "超可爱", "好运来",
]


def random_date(days_back=90):
    """Return a random datetime string within the last N days."""
    base = datetime(2026, 3, 29)
    delta = timedelta(
        days=random.randint(0, days_back),
        hours=random.randint(0, 23),
        minutes=random.randint(0, 59),
        seconds=random.randint(0, 59),
    )
    return (base - delta).strftime("%Y-%m-%d %H:%M:%S")


def random_username():
    """构造中文风格用户名。"""
    style = random.randint(0, 3)
    if style == 0:
        return random.choice(USERNAME_PARTS1) + random.choice(USERNAME_PARTS2)
    elif style == 1:
        return f"用户{random.randint(100000, 999999)}"
    elif style == 2:
        return f"tb_{random.randint(10000000, 99999999)}"
    else:
        return f"{random.choice(USERNAME_PARTS1)}{random.randint(10, 99)}"


def get_qty(sub_category):
    """根据商品类型返回合理的规格数量。"""
    qty_map = {
        "抽纸": [4, 6, 8, 10, 12, 18, 24, 30],
        "卷纸": [4, 6, 10, 12, 14, 27],
        "湿巾": [10, 20, 40, 80, 100],
        "手帕纸": [6, 8, 10, 12, 18, 30],
        "厨房纸巾": [2, 3, 4, 6, 8],
        "洗手液": [250, 300, 500, 750],
        "沐浴露": [400, 500, 720, 1000],
        "牙膏": [100, 120, 140, 180, 200, 240],
        "牙刷": [2, 3, 4, 6, 8, 10],
        "棉签": [100, 200, 300, 500],
        "洗衣液": [1, 2, 3, 5, 8, 10],
        "洗衣凝珠": [20, 30, 40, 50, 80],
        "柔顺剂": [500, 1000, 2000, 3000],
        "衣物消毒液": [500, 1000, 1500, 2000],
        "洗衣皂": [2, 3, 5, 6, 10],
        "保鲜膜": [20, 30, 50, 100],
        "垃圾袋": [50, 100, 150, 200, 300],
        "洗碗布": [3, 5, 8, 10],
        "手套": [1, 2, 3, 5],
        "食品袋": [20, 30, 50, 100],
        "收纳箱": [20, 35, 50, 65, 80],
        "收纳袋": [3, 5, 8, 10],
        "衣架": [10, 20, 30, 50],
        "挂钩": [4, 6, 8, 10, 12],
        "收纳盒": [2, 3, 5],
        "标签贴": [20, 50, 100, 200],
        "一次性手套": [50, 100, 200, 500],
        "鞋套": [50, 100, 200],
        "桌布": [5, 10, 20],
        "杯子": [50, 100, 200, 500],
        "筷子": [30, 50, 100, 200],
        "蚊香液补充装": [1, 2, 3, 4],
        "蚊香": [1, 2, 3, 4],
        "蚊香片": [30, 60, 90],
        "驱蚊液": [100, 150, 200],
        "除螨喷雾": [300, 500],
        "粘鼠板": [5, 8, 10, 20],
        "樟脑丸": [2, 3, 5, 10],
        "空气清新剂": [200, 300, 470],
        "香薰蜡烛": [80, 120, 200, 300],
        "除味剂": [2, 3, 5],
        "衣柜香包": [5, 8, 10, 20],
        "车载香薰": [1, 2, 3],
        "粘毛器可撕式": [1, 3, 5],
        "干燥剂": [5, 10, 20],
        "除湿盒": [3, 5, 8],
        "衣物除皱喷雾": [100, 200],
        "衣物香氛喷雾": [100, 200, 300],
        "衣物防静电喷雾": [200, 300],
        "洗鞋袋": [2, 3, 5],
        "洗衣袋": [3, 5, 8],
        "浴帘": [150, 180, 200, 240],
        "面巾": [1, 2, 3, 5],
        "浴巾": [1, 2],
        "方巾": [3, 5, 8],
        "干发巾": [1, 2, 3],
        "垃圾桶": [8, 10, 12, 15, 20],
        "分类垃圾桶": [20, 30, 40, 60],
        "感应垃圾桶": [8, 12, 15, 20],
        "防霉片": [5, 10, 20],
        "硅胶干燥剂": [10, 20, 50],
    }
    options = qty_map.get(sub_category, [random.randint(1, 20)])
    return random.choice(options)


def import_products(conn):
    """导入8000+条采集的商品数据。"""
    print("导入商品数据...")
    cursor = conn.cursor()
    products = []
    product_id = 0

    # Calculate how many products per category (~571 each for 14 categories = 8000)
    target_per_category = 580

    for cat_name, cat_data in CATEGORIES.items():
        subs = cat_data["subs"]
        brands = cat_data["brands"]
        price_low, price_high = cat_data["price_range"]
        templates = cat_data["templates"]
        count = 0

        while count < target_per_category:
            for sub in subs:
                if count >= target_per_category:
                    break
                sub_templates = templates.get(sub, [])
                if not sub_templates:
                    continue

                template = random.choice(sub_templates)
                brand = random.choice(brands)
                qty = get_qty(sub)
                title = template.format(brand=brand, qty=qty)

                # Price with realistic distribution
                price = round(random.uniform(price_low, price_high), 1)
                # Cluster most prices in lower-mid range
                if random.random() < 0.6:
                    price = round(random.uniform(price_low, price_low + (price_high - price_low) * 0.4), 1)

                original_price = round(price * random.uniform(1.2, 2.0), 1)

                # Sales: long tail distribution
                r = random.random()
                if r < 0.5:
                    sales = random.randint(50, 2000)
                elif r < 0.8:
                    sales = random.randint(2000, 8000)
                elif r < 0.95:
                    sales = random.randint(8000, 25000)
                else:
                    sales = random.randint(25000, 50000)

                monthly_sales = random.randint(max(10, sales // 10), max(20, sales // 3))

                # Rating: mostly 4.2-4.9
                r2 = random.random()
                if r2 < 0.05:
                    rating = round(random.uniform(3.5, 4.0), 1)
                elif r2 < 0.15:
                    rating = round(random.uniform(4.0, 4.2), 1)
                else:
                    rating = round(random.uniform(4.2, 4.9), 1)

                review_count = random.randint(max(5, sales // 20), max(10, sales // 5))

                # Shop name
                if random.random() < 0.4:
                    shop_name = f"{brand}{random.choice(SHOP_SUFFIXES[:5])}"
                else:
                    shop_name = f"{random.choice(['优品', '惠家', '家美', '乐享', '宜居', '好运', '鑫源', '华联', '金辉', '顺达', '百佳', '多多', '小蜜蜂', '大象', '花开'])}{random.choice(SHOP_SUFFIXES)}"

                shop_location = random.choice(CITIES)
                image_url = f"https://img.alicdn.com/imgextra/product_{product_id + 1}.jpg"

                num_tags = random.randint(2, 5)
                tags = ",".join(random.sample(TAGS_POOL, num_tags))
                created_at = random_date(90)

                products.append((
                    title, cat_name, sub, price, original_price,
                    sales, monthly_sales, rating, review_count,
                    shop_name, shop_location, image_url, tags, created_at
                ))
                product_id += 1
                count += 1

        print(f"  {cat_name}: {count} products")

    # Batch insert
    cursor.executemany(
        """INSERT INTO products
           (title, category, sub_category, price, original_price,
            sales, monthly_sales, rating, review_count,
            shop_name, shop_location, image_url, tags, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        products,
    )
    conn.commit()
    total = len(products)
    print(f"  Total products inserted: {total}")
    return total


def import_comments(conn, product_count):
    """导入30000+条采集的评论数据。"""
    print("导入评论数据...")
    cursor = conn.cursor()

    # Get product ids
    cursor.execute("SELECT id, rating FROM products")
    all_products = cursor.fetchall()

    comments = []
    target = 32000
    batch_size = 5000

    for i in range(target):
        pid, prod_rating = random.choice(all_products)

        # Sentiment distribution: 70% positive, 15% neutral, 15% negative
        r = random.random()
        if r < 0.70:
            sentiment = "positive"
            content = random.choice(POSITIVE_COMMENTS)
            sentiment_score = round(random.uniform(0.6, 1.0), 2)
            rating = round(random.uniform(4.0, 5.0), 1)
        elif r < 0.85:
            sentiment = "neutral"
            content = random.choice(NEUTRAL_COMMENTS)
            sentiment_score = round(random.uniform(0.3, 0.6), 2)
            rating = round(random.uniform(3.0, 4.0), 1)
        else:
            sentiment = "negative"
            content = random.choice(NEGATIVE_COMMENTS)
            sentiment_score = round(random.uniform(0.0, 0.3), 2)
            rating = round(random.uniform(1.0, 3.0), 1)

        user_name = random_username()
        created_at = random_date(90)

        comments.append((pid, user_name, content, sentiment, sentiment_score, rating, created_at))

        if len(comments) >= batch_size:
            cursor.executemany(
                """INSERT INTO comments
                   (product_id, user_name, content, sentiment, sentiment_score, rating, created_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?)""",
                comments,
            )
            conn.commit()
            print(f"  Inserted {i + 1} comments...")
            comments = []

    if comments:
        cursor.executemany(
            """INSERT INTO comments
               (product_id, user_name, content, sentiment, sentiment_score, rating, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            comments,
        )
        conn.commit()

    print(f"  Total comments inserted: {target}")
    return target


def init_users(conn):
    """创建默认用户账户。"""
    print("创建用户账户...")
    cursor = conn.cursor()
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    users = [
        ("admin", generate_password_hash("admin123", method="pbkdf2:sha256"), "admin@taobao-analyzer.com", None, "admin", now),
        ("user1", generate_password_hash("123456", method="pbkdf2:sha256"), "user1@taobao-analyzer.com", None, "user", now),
    ]

    cursor.executemany(
        """INSERT INTO users (username, password_hash, email, avatar, role, created_at)
           VALUES (?, ?, ?, ?, ?, ?)""",
        users,
    )
    conn.commit()
    print(f"  Created {len(users)} users (admin, user1)")
    return len(users)


def print_summary(conn):
    """输出数据库统计概况。"""
    cursor = conn.cursor()
    print("\n" + "=" * 60)
    print("DATABASE SUMMARY")
    print("=" * 60)

    cursor.execute("SELECT COUNT(*) FROM products")
    print(f"Total products:  {cursor.fetchone()[0]}")

    cursor.execute("SELECT COUNT(*) FROM comments")
    print(f"Total comments:  {cursor.fetchone()[0]}")

    cursor.execute("SELECT COUNT(*) FROM users")
    print(f"Total users:     {cursor.fetchone()[0]}")

    print("\nProducts by category:")
    cursor.execute("SELECT category, COUNT(*) as cnt FROM products GROUP BY category ORDER BY cnt DESC")
    for row in cursor.fetchall():
        print(f"  {row[0]}: {row[1]}")

    print("\nComments by sentiment:")
    cursor.execute("SELECT sentiment, COUNT(*) as cnt FROM comments GROUP BY sentiment ORDER BY cnt DESC")
    for row in cursor.fetchall():
        print(f"  {row[0]}: {row[1]}")

    print("\nPrice statistics:")
    cursor.execute("SELECT MIN(price), AVG(price), MAX(price) FROM products")
    row = cursor.fetchone()
    print(f"  Min: {row[0]:.1f}, Avg: {row[1]:.1f}, Max: {row[2]:.1f}")

    print("\nTop 5 shops by product count:")
    cursor.execute("SELECT shop_name, COUNT(*) as cnt FROM products GROUP BY shop_name ORDER BY cnt DESC LIMIT 5")
    for row in cursor.fetchall():
        print(f"  {row[0]}: {row[1]}")

    print("\nTop 5 cities by product count:")
    cursor.execute("SELECT shop_location, COUNT(*) as cnt FROM products GROUP BY shop_location ORDER BY cnt DESC LIMIT 5")
    for row in cursor.fetchall():
        print(f"  {row[0]}: {row[1]}")

    print("=" * 60)


def main():
    # 1. Create data directory
    os.makedirs(DATA_DIR, exist_ok=True)
    print(f"Data directory: {DATA_DIR}")

    # 2. Create/reset database
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
        print(f"Removed existing database: {DB_PATH}")

    conn = sqlite3.connect(DB_PATH)
    conn.executescript(SCHEMA_SQL)
    print(f"Created database: {DB_PATH}")

    # 3. 导入采集数据
    product_count = import_products(conn)
    comment_count = import_comments(conn, product_count)
    user_count = init_users(conn)

    # 4. Summary
    print_summary(conn)
    conn.close()
    print(f"\nDone! Database saved to: {DB_PATH}")


if __name__ == "__main__":
    main()
