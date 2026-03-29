import math
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..utils import get_db, make_response

user_bp = Blueprint('user', __name__, url_prefix='/api')


@user_bp.route('/user/stats', methods=['GET'])
@jwt_required()
def user_stats():
    try:
        user_id = get_jwt_identity()
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM favorites WHERE user_id = ?", (user_id,))
        fav_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM browse_history WHERE user_id = ?", (user_id,))
        hist_count = cursor.fetchone()[0]
        cursor.execute("SELECT created_at FROM users WHERE id = ?", (user_id,))
        row = cursor.fetchone()
        conn.close()
        return make_response(200, data={
            'favorites_count': fav_count,
            'history_count': hist_count,
            'join_date': row['created_at'] if row else '',
        })
    except Exception as e:
        return make_response(500, message=str(e))


@user_bp.route('/user/favorites', methods=['GET'])
@jwt_required()
def user_favorites():
    try:
        user_id = get_jwt_identity()
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT f.id, f.product_id, p.title, p.price, p.sales, f.created_at
            FROM favorites f JOIN products p ON f.product_id = p.id
            WHERE f.user_id = ? ORDER BY f.created_at DESC
        """, (user_id,))
        rows = [dict(r) for r in cursor.fetchall()]
        conn.close()
        return make_response(200, data=rows)
    except Exception as e:
        return make_response(500, message=str(e))


@user_bp.route('/user/favorites/<int:product_id>', methods=['DELETE'])
@jwt_required()
def user_remove_favorite(product_id):
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


@user_bp.route('/user/history', methods=['GET'])
@jwt_required()
def user_history():
    try:
        user_id = get_jwt_identity()
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT bh.id, bh.product_id, p.title, p.price, bh.created_at as viewed_at
            FROM browse_history bh JOIN products p ON bh.product_id = p.id
            WHERE bh.user_id = ? ORDER BY bh.created_at DESC LIMIT 50
        """, (user_id,))
        rows = [dict(r) for r in cursor.fetchall()]
        conn.close()
        return make_response(200, data=rows)
    except Exception as e:
        return make_response(500, message=str(e))


@user_bp.route('/favorites', methods=['POST'])
@jwt_required()
def add_favorite():
    try:
        user_id = get_jwt_identity()
        body = request.get_json(silent=True) or {}
        product_id = body.get('product_id')

        if not product_id:
            return make_response(400, message='product_id is required')

        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("SELECT id FROM products WHERE id = ?", (product_id,))
        if not cursor.fetchone():
            conn.close()
            return make_response(404, message='product not found')

        cursor.execute("SELECT id FROM favorites WHERE user_id = ? AND product_id = ?",
                        (user_id, product_id))
        if cursor.fetchone():
            conn.close()
            return make_response(400, message='already in favorites')

        cursor.execute("INSERT INTO favorites (user_id, product_id) VALUES (?, ?)",
                        (user_id, product_id))
        conn.commit()
        conn.close()
        return make_response(200, message='added to favorites')
    except Exception as e:
        return make_response(500, message=str(e))


@user_bp.route('/favorites/<int:product_id>', methods=['DELETE'])
@jwt_required()
def remove_favorite(product_id):
    try:
        user_id = get_jwt_identity()
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM favorites WHERE user_id = ? AND product_id = ?",
                        (user_id, product_id))
        conn.commit()
        deleted = cursor.rowcount
        conn.close()

        if deleted == 0:
            return make_response(404, message='favorite not found')
        return make_response(200, message='removed from favorites')
    except Exception as e:
        return make_response(500, message=str(e))


@user_bp.route('/favorites', methods=['GET'])
@jwt_required()
def list_favorites():
    try:
        user_id = get_jwt_identity()
        page = request.args.get('page', 1, type=int)
        page_size = request.args.get('page_size', 20, type=int)

        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("SELECT COUNT(*) FROM favorites WHERE user_id = ?", (user_id,))
        total = cursor.fetchone()[0]

        offset = (page - 1) * page_size
        cursor.execute("""
            SELECT p.*, f.created_at as favorited_at
            FROM favorites f
            JOIN products p ON f.product_id = p.id
            WHERE f.user_id = ?
            ORDER BY f.created_at DESC
            LIMIT ? OFFSET ?
        """, (user_id, page_size, offset))
        rows = [dict(r) for r in cursor.fetchall()]
        conn.close()

        return make_response(200, data={
            'list': rows,
            'total': total,
            'page': page,
            'page_size': page_size,
        })
    except Exception as e:
        return make_response(500, message=str(e))


@user_bp.route('/history', methods=['POST'])
@jwt_required()
def add_history():
    try:
        user_id = get_jwt_identity()
        body = request.get_json(silent=True) or {}
        product_id = body.get('product_id')

        if not product_id:
            return make_response(400, message='product_id is required')

        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("SELECT id FROM products WHERE id = ?", (product_id,))
        if not cursor.fetchone():
            conn.close()
            return make_response(404, message='product not found')

        cursor.execute("INSERT INTO browse_history (user_id, product_id) VALUES (?, ?)",
                        (user_id, product_id))
        conn.commit()
        conn.close()
        return make_response(200, message='history recorded')
    except Exception as e:
        return make_response(500, message=str(e))


@user_bp.route('/history', methods=['GET'])
@jwt_required()
def list_history():
    try:
        user_id = get_jwt_identity()
        page = request.args.get('page', 1, type=int)
        page_size = request.args.get('page_size', 20, type=int)

        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("SELECT COUNT(*) FROM browse_history WHERE user_id = ?", (user_id,))
        total = cursor.fetchone()[0]

        offset = (page - 1) * page_size
        cursor.execute("""
            SELECT p.*, bh.created_at as browsed_at
            FROM browse_history bh
            JOIN products p ON bh.product_id = p.id
            WHERE bh.user_id = ?
            ORDER BY bh.created_at DESC
            LIMIT ? OFFSET ?
        """, (user_id, page_size, offset))
        rows = [dict(r) for r in cursor.fetchall()]
        conn.close()

        return make_response(200, data={
            'list': rows,
            'total': total,
            'page': page,
            'page_size': page_size,
        })
    except Exception as e:
        return make_response(500, message=str(e))
