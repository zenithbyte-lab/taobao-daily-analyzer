import math
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..utils import get_db, make_response

products_bp = Blueprint('products', __name__, url_prefix='/api')


@products_bp.route('/products', methods=['GET'])
def get_products():
    try:
        page = request.args.get('page', 1, type=int)
        page_size = request.args.get('page_size', 20, type=int)
        keyword = request.args.get('keyword', '').strip()
        category = request.args.get('category', '').strip()
        min_price = request.args.get('min_price', type=float)
        max_price = request.args.get('max_price', type=float)
        sort_by = request.args.get('sort_by', '').strip()

        conn = get_db()
        cursor = conn.cursor()

        where_clauses = []
        params = []

        if keyword:
            where_clauses.append("(title LIKE ? OR tags LIKE ?)")
            params.extend([f'%{keyword}%', f'%{keyword}%'])
        if category:
            where_clauses.append("category = ?")
            params.append(category)
        if min_price is not None:
            where_clauses.append("price >= ?")
            params.append(min_price)
        if max_price is not None:
            where_clauses.append("price <= ?")
            params.append(max_price)

        where_sql = (" WHERE " + " AND ".join(where_clauses)) if where_clauses else ""

        order_map = {
            'price': 'price ASC',
            'price_desc': 'price DESC',
            'sales': 'sales DESC',
            'rating': 'rating DESC',
        }
        order_sql = f" ORDER BY {order_map[sort_by]}" if sort_by in order_map else " ORDER BY id DESC"

        cursor.execute(f"SELECT COUNT(*) FROM products{where_sql}", params)
        total = cursor.fetchone()[0]

        offset = (page - 1) * page_size
        cursor.execute(
            f"SELECT * FROM products{where_sql}{order_sql} LIMIT ? OFFSET ?",
            params + [page_size, offset]
        )
        rows = [dict(r) for r in cursor.fetchall()]
        conn.close()

        return make_response(200, data={
            'list': rows,
            'total': total,
            'page': page,
            'page_size': page_size,
            'total_pages': math.ceil(total / page_size) if page_size else 1,
        })
    except Exception as e:
        return make_response(500, message=str(e))


@products_bp.route('/products/<int:product_id>', methods=['GET'])
def get_product_detail(product_id):
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
        product = cursor.fetchone()
        if not product:
            conn.close()
            return make_response(404, message='product not found')

        product_dict = dict(product)

        cursor.execute(
            "SELECT * FROM comments WHERE product_id = ? ORDER BY created_at DESC LIMIT 50",
            (product_id,)
        )
        product_dict['comments'] = [dict(r) for r in cursor.fetchall()]
        conn.close()

        return make_response(200, data=product_dict)
    except Exception as e:
        return make_response(500, message=str(e))


@products_bp.route('/categories', methods=['GET'])
def get_categories():
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY count DESC"
        )
        rows = [dict(r) for r in cursor.fetchall()]
        conn.close()
        return make_response(200, data=rows)
    except Exception as e:
        return make_response(500, message=str(e))


@products_bp.route('/products/<int:product_id>/comments', methods=['GET'])
def get_product_comments(product_id):
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM comments WHERE product_id = ? ORDER BY created_at DESC LIMIT 50",
            (product_id,)
        )
        rows = [dict(r) for r in cursor.fetchall()]
        conn.close()
        return make_response(200, data=rows)
    except Exception as e:
        return make_response(500, message=str(e))


@products_bp.route('/products/<int:product_id>/view', methods=['POST'])
@jwt_required(optional=True)
def record_product_view(product_id):
    try:
        user_id = get_jwt_identity()
        if not user_id:
            return make_response(200, message='ok')
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO browse_history (user_id, product_id) VALUES (?, ?)",
                        (user_id, product_id))
        conn.commit()
        conn.close()
        return make_response(200, message='ok')
    except Exception as e:
        return make_response(500, message=str(e))


@products_bp.route('/products/<int:product_id>/favorite', methods=['POST'])
@jwt_required()
def add_product_favorite(product_id):
    try:
        user_id = get_jwt_identity()
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM favorites WHERE user_id = ? AND product_id = ?",
                        (user_id, product_id))
        if cursor.fetchone():
            conn.close()
            return make_response(200, message='already in favorites')
        cursor.execute("INSERT INTO favorites (user_id, product_id) VALUES (?, ?)",
                        (user_id, product_id))
        conn.commit()
        conn.close()
        return make_response(200, message='added')
    except Exception as e:
        return make_response(500, message=str(e))


@products_bp.route('/products/<int:product_id>/favorite', methods=['DELETE'])
@jwt_required()
def remove_product_favorite(product_id):
    try:
        user_id = get_jwt_identity()
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM favorites WHERE user_id = ? AND product_id = ?",
                        (user_id, product_id))
        conn.commit()
        conn.close()
        return make_response(200, message='removed')
    except Exception as e:
        return make_response(500, message=str(e))
