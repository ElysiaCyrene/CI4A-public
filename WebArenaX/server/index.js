import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
dotenv.config({path:fileURLToPath(new URL('../../.env',import.meta.url)),quiet:true});
import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";

const app = express();
const port = Number(process.env.API_PORT || 5000);

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

app.use(cors());
app.use(express.json());

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'ci4a',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'magento',
  connectTimeout: 5000,
};

async function getConnection() {
  return await mysql.createConnection(dbConfig);
}

// HTML实体解码函数
app.get('/api/health', async (_req, res) => {
  let connection;
  try {
    connection = await getConnection();
    await connection.execute('SELECT 1 FROM sales_order LIMIT 1');
    await connection.execute('SELECT 1 FROM catalog_product_entity LIMIT 1');
    res.json({service:'ci4a-webarena', database:'ready'});
  } catch (error) {
    res.status(503).json({service:'ci4a-webarena', database:'unavailable', code:error.code || 'DB_ERROR', message:'Configure .env and supply an authorized private Magento/WebArena database.'});
  } finally { if (connection) await connection.end(); }
});

function decodeHtmlEntities(text) {
  if (!text) return text;
  const entities = {
    "&trade;": "™",
    "&reg;": "®",
    "&copy;": "©",
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&nbsp;": " ",
  };
  return text.replace(
    /&[a-z]+;|&#\d+;/gi,
    (match) => entities[match.toLowerCase()] || match
  );
}

// Dashboard Stats
app.get("/api/dashboard/stats", async (req, res) => {
  try {
    const conn = await getConnection();
    const storeId = req.query.store_id;

    // Formula based on Magento's Collection.php for Live data
    // Lifetime Sales = SUM( (Invoiced - TaxInvoiced - ShippingInvoiced - (Refunded - TaxRefunded - ShippingRefunded)) * BaseToGlobalRate )
    const salesExpression = `
      (
        IFNULL(base_total_invoiced, 0) - 
        IFNULL(base_tax_invoiced, 0) - 
        IFNULL(base_shipping_invoiced, 0) - 
        (
          IFNULL(base_total_refunded, 0) - 
          IFNULL(base_tax_refunded, 0) - 
          IFNULL(base_shipping_refunded, 0)
        )
      ) * IFNULL(base_to_global_rate, 0)
    `;

    let query = `
      SELECT 
        SUM(${salesExpression}) as lifetime_sales, 
        AVG(${salesExpression}) as average_order 
      FROM sales_order 
      WHERE status != 'canceled' 
      AND state NOT IN ('new', 'pending_payment')
    `;

    const params = [];

    if (storeId && storeId !== "undefined" && storeId !== "all") {
      query += " AND store_id = ?";
      params.push(storeId);
    }

    const [rows] = await conn.execute(query, params);
    await conn.end();

    const lifetimeSales = rows[0].lifetime_sales || 0;
    const averageOrder = rows[0].average_order || 0;

    res.json({
      lifetime_sales: lifetimeSales,
      average_order: averageOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Last Orders
app.get("/api/dashboard/last-orders", async (req, res) => {
  try {
    const conn = await getConnection();
    const storeId = req.query.store_id;

    let query = `
      SELECT CONCAT(customer_firstname, ' ', customer_lastname) as customer, total_qty_ordered as items, grand_total as total 
      FROM sales_order 
      WHERE 1=1
    `;
    const params = [];

    if (storeId && storeId !== "undefined" && storeId !== "all") {
      query += " AND store_id = ?";
      params.push(storeId);
    }

    query += " ORDER BY entity_id DESC LIMIT 5";

    const [rows] = await conn.execute(query, params);
    await conn.end();
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Last Search Terms
app.get("/api/dashboard/last-search-terms", async (req, res) => {
  try {
    const conn = await getConnection();
    const storeId = req.query.store_id;

    let query = `
      SELECT query_text as term, num_results as results, popularity as uses 
      FROM search_query 
      WHERE 1=1
    `;
    const params = [];

    if (storeId && storeId !== "undefined" && storeId !== "all") {
      query += " AND store_id = ?";
      params.push(storeId);
    }

    query += " ORDER BY updated_at DESC LIMIT 5";

    const [rows] = await conn.execute(query, params);
    await conn.end();
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Top Search Terms
app.get("/api/dashboard/top-search-terms", async (req, res) => {
  try {
    const conn = await getConnection();
    const storeId = req.query.store_id;

    let query = `
      SELECT query_text as term, num_results as results, popularity as uses 
      FROM search_query 
      WHERE 1=1
    `;
    const params = [];

    if (storeId && storeId !== "undefined" && storeId !== "all") {
      query += " AND store_id = ?";
      params.push(storeId);
    }

    query += " ORDER BY popularity DESC LIMIT 5";

    const [rows] = await conn.execute(query, params);
    await conn.end();
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Bestsellers
app.get("/api/dashboard/bestsellers", async (req, res) => {
  try {
    const conn = await getConnection();
    const storeId = req.query.store_id;

    let query = `
      SELECT i.name as product, i.price, SUM(i.qty_ordered) as quantity 
      FROM sales_order_item i
      JOIN sales_order o ON i.order_id = o.entity_id
      WHERE o.status != 'canceled'
    `;
    const params = [];

    if (storeId && storeId !== "undefined" && storeId !== "all") {
      query += " AND o.store_id = ?";
      params.push(storeId);
    }

    query += `
      GROUP BY i.product_id, i.name, i.price 
      ORDER BY quantity DESC 
      LIMIT 5
    `;

    const [rows] = await conn.execute(query, params);
    await conn.end();

    // 解码HTML实体
    const results = rows.map((row) => ({
      product: decodeHtmlEntities(row.product),
      price: row.price,
      quantity: row.quantity,
    }));

    res.json(results);
  } catch (error) {
    console.error(error);
    res.json([]);
  }
});

// New Customers
app.get("/api/dashboard/new-customers", async (req, res) => {
  try {
    const conn = await getConnection();
    const storeId = req.query.store_id;

    let query = `
      SELECT CONCAT(firstname, ' ', lastname) as customer, entity_id 
      FROM customer_entity 
      WHERE 1=1
    `;
    const params = [];

    if (storeId && storeId !== "undefined" && storeId !== "all") {
      query += " AND store_id = ?";
      params.push(storeId);
    }

    query += " ORDER BY created_at DESC LIMIT 5";

    const [rows] = await conn.execute(query, params);

    const results = [];
    for (const row of rows) {
      let subQuery = `
            SELECT COUNT(*) as orders, AVG(grand_total) as average, SUM(grand_total) as total 
            FROM sales_order 
            WHERE customer_id = ?
      `;
      const subParams = [row.entity_id];

      if (storeId && storeId !== "undefined" && storeId !== "all") {
        subQuery += " AND store_id = ?";
        subParams.push(storeId);
      }

      const [orderStats] = await conn.execute(subQuery, subParams);

      results.push({
        customer: row.customer,
        orders: orderStats[0].orders || 0,
        average: orderStats[0].average || 0,
        total: orderStats[0].total || 0,
      });
    }

    await conn.end();
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Customers
app.get("/api/dashboard/customers", async (req, res) => {
  try {
    const conn = await getConnection();
    const storeId = req.query.store_id;

    let query = `
      SELECT customer_id, COUNT(*) as order_count 
      FROM sales_order 
      WHERE customer_id IS NOT NULL 
    `;
    const params = [];

    if (storeId && storeId !== "undefined" && storeId !== "all") {
      query += " AND store_id = ?";
      params.push(storeId);
    }

    query += `
      GROUP BY customer_id 
      ORDER BY order_count DESC 
      LIMIT 5
    `;

    const [rows] = await conn.execute(query, params);

    const results = [];
    for (const row of rows) {
      const [customer] = await conn.execute(
        "SELECT CONCAT(firstname, ' ', lastname) as name FROM customer_entity WHERE entity_id = ?",
        [row.customer_id]
      );

      if (customer.length > 0) {
        let subQuery = `
          SELECT AVG(grand_total) as average, SUM(grand_total) as total 
          FROM sales_order 
          WHERE customer_id = ?
        `;
        const subParams = [row.customer_id];

        if (storeId && storeId !== "undefined" && storeId !== "all") {
          subQuery += " AND store_id = ?";
          subParams.push(storeId);
        }

        const [stats] = await conn.execute(subQuery, subParams);

        results.push({
          customer: customer[0].name,
          orders: row.order_count,
          average: stats[0].average || 0,
          total: stats[0].total || 0,
        });
      }
    }

    await conn.end();
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Bestsellers Report
app.get("/api/reports/bestsellers", async (req, res) => {
  try {
    const conn = await getConnection();
    const {
      from,
      to,
      period = "year",
      show_empty_rows = "0",
      store_id,
    } = req.query;

    // 根据period选择正确的聚合表 (与Magento的Collection.php逻辑一致)
    let tableName;
    let periodFormat;

    if (period === "year") {
      tableName = "sales_bestsellers_aggregated_yearly";
      periodFormat = "%Y";
    } else if (period === "month") {
      tableName = "sales_bestsellers_aggregated_monthly";
      periodFormat = "%Y-%m";
    } else {
      tableName = "sales_bestsellers_aggregated_daily";
      periodFormat = "%Y-%m-%d";
    }

    // 如果没有指定时间范围且没有按period分组，使用yearly表并按product分组
    const groupByProduct = !period || period === "year";

    let query;
    const params = [];

    if (groupByProduct && !from && !to) {
      // 按产品分组，不按时间段 - 使用yearly表汇总
      query = `
        SELECT 
          product_id,
          MAX(product_name) as product_name,
          MAX(product_price) as product_price,
          SUM(qty_ordered) as qty_ordered
        FROM sales_bestsellers_aggregated_yearly
        WHERE product_id IS NOT NULL
      `;

      if (store_id && store_id !== "undefined" && store_id !== "all") {
        query += " AND store_id = ?";
        params.push(store_id);
      }

      query += `
        GROUP BY product_id
        ORDER BY qty_ordered DESC
        LIMIT 5
      `;
    } else if (groupByProduct && (from || to)) {
      // 按产品分组，有时间范围 - 使用daily表
      query = `
        SELECT 
          product_id,
          MAX(product_name) as product_name,
          MAX(product_price) as product_price,
          SUM(qty_ordered) as qty_ordered
        FROM sales_bestsellers_aggregated_daily
        WHERE product_id IS NOT NULL
      `;

      if (from) {
        query += " AND period >= ?";
        params.push(from);
      }
      if (to) {
        query += " AND period <= ?";
        params.push(to);
      }
      if (store_id && store_id !== "undefined" && store_id !== "all") {
        query += " AND store_id = ?";
        params.push(store_id);
      }

      query += `
        GROUP BY product_id
        ORDER BY qty_ordered DESC
        LIMIT 5
      `;
    } else {
      // 按时间段和产品分组，每个时间段最多显示5个产品
      query = `
        SELECT period, product_name, product_price, qty_ordered
        FROM (
          SELECT 
            DATE_FORMAT(period, '${periodFormat}') as period,
            MAX(product_name) as product_name,
            MAX(product_price) as product_price,
            SUM(qty_ordered) as qty_ordered,
            ROW_NUMBER() OVER (PARTITION BY DATE_FORMAT(period, '${periodFormat}') ORDER BY SUM(qty_ordered) DESC) as rn
          FROM ${tableName}
          WHERE product_id IS NOT NULL
      `;

      if (from) {
        query += " AND period >= ?";
        params.push(from);
      }
      if (to) {
        query += " AND period <= ?";
        params.push(to);
      }
      if (store_id && store_id !== "undefined" && store_id !== "all") {
        query += " AND store_id = ?";
        params.push(store_id);
      }

      query += `
          GROUP BY DATE_FORMAT(period, '${periodFormat}'), product_id
        ) ranked
        WHERE rn <= 5
        ORDER BY period DESC, qty_ordered DESC
      `;
    }

    const [rows] = await conn.execute(query, params);
    await conn.end();

    // 格式化结果并解码HTML实体
    const results = rows.map((row) => ({
      period: row.period || "",
      product_name: decodeHtmlEntities(row.product_name),
      price: parseFloat(row.product_price || 0).toFixed(2),
      qty_ordered: parseInt(row.qty_ordered || 0),
    }));

    res.json({
      items: results,
      total_count: results.length,
    });
  } catch (error) {
    console.error("Bestsellers API error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get Single Order Details
app.get("/api/sales/orders/:id", async (req, res) => {
  try {
    const conn = await getConnection();
    const orderId = req.params.id;

    // Fetch Order Info
    const [orders] = await conn.execute(
      `SELECT * FROM sales_order WHERE entity_id = ?`,
      [orderId]
    );

    if (orders.length === 0) {
      await conn.end();
      return res.status(404).json({ error: "Order not found" });
    }

    const order = orders[0];

    // Fetch Order Items
    const [items] = await conn.execute(
      `SELECT * FROM sales_order_item WHERE order_id = ?`,
      [orderId]
    );

    // Fetch Addresses
    const [addresses] = await conn.execute(
      `SELECT * FROM sales_order_address WHERE parent_id = ?`,
      [orderId]
    );

    // Fetch Status History
    const [history] = await conn.execute(
      `SELECT * FROM sales_order_status_history WHERE parent_id = ? ORDER BY created_at DESC`,
      [orderId]
    );

    // Fetch Payment (Simplified, assuming payment method is stored in sales_order_payment)
    const [payment] = await conn.execute(
      `SELECT method FROM sales_order_payment WHERE parent_id = ?`,
      [orderId]
    );

    await conn.end();

    const billingAddress = addresses.find((a) => a.address_type === "billing");
    const shippingAddress = addresses.find(
      (a) => a.address_type === "shipping"
    );

    res.json({
      ...order,
      items,
      billing_address: billingAddress,
      shipping_address: shippingAddress,
      status_history: history,
      payment: payment[0] || {},
    });
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update Order Status / Add Comment
app.post("/api/sales/orders/:id/status", async (req, res) => {
  try {
    const conn = await getConnection();
    const orderId = req.params.id;
    const { status, comment, notify, visible } = req.body;

    // Update Order Status
    if (status) {
      await conn.execute(
        `UPDATE sales_order SET status = ? WHERE entity_id = ?`,
        [status, orderId]
      );
    }

    // Add Status History
    if (status || comment) {
      await conn.execute(
        `INSERT INTO sales_order_status_history (parent_id, status, comment, is_customer_notified, is_visible_on_front, created_at) VALUES (?, ?, ?, ?, ?, NOW())`,
        [
          orderId,
          status || null,
          comment || "",
          notify ? 1 : 0,
          visible ? 1 : 0,
        ]
      );
    }

    await conn.end();
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: error.message });
  }
});

// Reviews API
app.get("/api/reviews", async (req, res) => {
  try {
    const conn = await getConnection();
    const {
      page = 1,
      pageSize = 20,
      id,
      created_from,
      created_to,
      status,
      title,
      nickname,
      review,
      type,
      product,
      sku,
    } = req.query;
    const offset = (page - 1) * pageSize;

    // 构建 WHERE 子句
    let whereConditions = [];
    let params = [];

    if (id) {
      whereConditions.push("r.review_id = ?");
      params.push(id);
    }
    if (created_from) {
      whereConditions.push("r.created_at >= ?");
      params.push(created_from);
    }
    if (created_to) {
      whereConditions.push("r.created_at <= ?");
      params.push(created_to + " 23:59:59");
    }
    if (status) {
      let statusId = status;
      const statusMap = {
        Approved: 1,
        Pending: 2,
        "Not Approved": 3,
      };
      if (statusMap[status]) {
        statusId = statusMap[status];
      }
      whereConditions.push("r.status_id = ?");
      params.push(statusId);
    }
    if (title) {
      whereConditions.push("rd.title LIKE ?");
      params.push(`%${title}%`);
    }
    if (nickname) {
      whereConditions.push("rd.nickname LIKE ?");
      params.push(`%${nickname}%`);
    }
    if (review) {
      whereConditions.push("rd.detail LIKE ?");
      params.push(`%${review}%`);
    }
    if (req.query.visibility) {
      whereConditions.push("s.store_id = ?");
      params.push(req.query.visibility);
    }
    if (req.query.customer_id) {
      whereConditions.push("rd.customer_id = ?");
      params.push(req.query.customer_id);
    }
    if (type) {
      if (type === "Customer") {
        whereConditions.push("rd.customer_id IS NOT NULL");
      } else if (type === "Guest") {
        whereConditions.push("rd.customer_id IS NULL");
      }
    }
    if (product) {
      whereConditions.push("cpev.value LIKE ?");
      params.push(`%${product}%`);
    }
    if (sku) {
      whereConditions.push("cpe.sku LIKE ?");
      params.push(`%${sku}%`);
    }

    let whereSql = "";
    if (whereConditions.length > 0) {
      whereSql = "WHERE " + whereConditions.join(" AND ");
    }

    // 获取总数 (带筛选)
    const countQuery = `
      SELECT COUNT(DISTINCT r.review_id) as total 
      FROM review r
      LEFT JOIN review_detail rd ON r.review_id = rd.review_id
      LEFT JOIN catalog_product_entity cpe ON r.entity_pk_value = cpe.entity_id
      LEFT JOIN catalog_product_entity_varchar cpev ON cpe.entity_id = cpev.entity_id 
        AND cpev.attribute_id = (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'name' AND entity_type_id = 4)
        AND cpev.store_id = 0
      LEFT JOIN review_store rst ON r.review_id = rst.review_id
      LEFT JOIN store s ON rst.store_id = s.store_id
      ${whereSql}
    `;

    const countParams = [...params];
    const [countResult] = await conn.execute(countQuery, countParams);
    const total = countResult[0].total;

    // 排序逻辑
    let orderBy = "MAX(r.created_at) DESC";
    if (req.query.sortField && req.query.sortOrder) {
      const order = req.query.sortOrder === "ascend" ? "ASC" : "DESC";
      switch (req.query.sortField) {
        case "review_id":
          orderBy = `r.review_id ${order}`;
          break;
        case "created_at":
          orderBy = `MAX(r.created_at) ${order}`;
          break;
        case "status_name":
          orderBy = `MAX(rs.status_code) ${order}`;
          break;
        case "title":
          orderBy = `MAX(rd.title) ${order}`;
          break;
        case "nickname":
          orderBy = `MAX(rd.nickname) ${order}`;
          break;
        case "detail":
          orderBy = `MAX(rd.detail) ${order}`;
          break;
        case "store_names":
          orderBy = `store_names ${order}`;
          break;
        case "type":
          orderBy = `type ${order}`;
          break;
        case "product_name":
          orderBy = `MAX(cpev.value) ${order}`;
          break;
        case "sku":
          orderBy = `MAX(cpe.sku) ${order}`;
          break;
      }
    }

    // 获取reviews数据
    const query = `
      SELECT 
        r.review_id,
        MAX(r.created_at) as created_at,
        MAX(r.status_id) as status_id,
        MAX(rs.status_code) as status_name,
        MAX(rd.title) as title,
        MAX(rd.nickname) as nickname,
        MAX(rd.detail) as detail,
        CASE 
          WHEN MAX(rd.customer_id) IS NOT NULL THEN 'Customer'
          ELSE 'Guest'
        END as type,
        MAX(cpev.value) as product_name,
        MAX(cpe.sku) as sku,
        -- Average percent (20/40/60/80/100) from rating_option_vote for this review
        AVG(rov.percent) as rating_percent,
        -- Convert percent to 1-5 scale (round)
        ROUND(AVG(rov.percent)/20) as rating_value,
        GROUP_CONCAT(DISTINCT s.name SEPARATOR ', ') as store_names
      FROM review r
      LEFT JOIN review_detail rd ON r.review_id = rd.review_id
      LEFT JOIN review_status rs ON r.status_id = rs.status_id
      LEFT JOIN catalog_product_entity cpe ON r.entity_pk_value = cpe.entity_id
      LEFT JOIN catalog_product_entity_varchar cpev ON cpe.entity_id = cpev.entity_id 
        AND cpev.attribute_id = (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'name' AND entity_type_id = 4)
        AND cpev.store_id = 0
      LEFT JOIN review_store rst ON r.review_id = rst.review_id
      LEFT JOIN store s ON rst.store_id = s.store_id
      LEFT JOIN rating_option_vote rov ON r.review_id = rov.review_id
      ${whereSql}
      GROUP BY r.review_id
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;

    params.push(String(pageSize));
    params.push(String(offset));

    const [rows] = await conn.execute(query, params);
    await conn.end();

    res.json({
      items: rows,
      total: total,
    });
  } catch (error) {
    console.error("Reviews API error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Stores API
app.get("/api/stores", async (req, res) => {
  try {
    const conn = await getConnection();
    const [rows] = await conn.execute("SELECT store_id, name FROM store");
    await conn.end();
    res.json(rows);
  } catch (error) {
    console.error("Stores API error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Search Terms API
app.get("/api/search-terms", async (req, res) => {
  try {
    const conn = await getConnection();
    const {
      page = 1,
      pageSize = 20,
      id,
      query_text,
      store_id,
      results_from,
      results_to,
      hits_from,
      hits_to,
      sortField,
      sortOrder,
    } = req.query;
    const offset = (page - 1) * pageSize;

    let whereConditions = [];
    let params = [];

    if (id) {
      whereConditions.push("sq.query_id = ?");
      params.push(id);
    }
    if (query_text) {
      whereConditions.push("sq.query_text LIKE ?");
      params.push(`%${query_text}%`);
    }
    if (store_id) {
      whereConditions.push("sq.store_id = ?");
      params.push(store_id);
    }
    if (results_from) {
      whereConditions.push("sq.num_results >= ?");
      params.push(results_from);
    }
    if (results_to) {
      whereConditions.push("sq.num_results <= ?");
      params.push(results_to);
    }
    if (hits_from) {
      whereConditions.push("sq.popularity >= ?");
      params.push(hits_from);
    }
    if (hits_to) {
      whereConditions.push("sq.popularity <= ?");
      params.push(hits_to);
    }

    let whereSql = "";
    if (whereConditions.length > 0) {
      whereSql = "WHERE " + whereConditions.join(" AND ");
    }

    // Sorting
    let orderBy = "ORDER BY sq.query_id DESC"; // Default
    if (sortField && sortOrder) {
      const validFields = [
        "query_id",
        "query_text",
        "store_id",
        "num_results",
        "popularity",
      ];
      if (validFields.includes(sortField)) {
        orderBy = `ORDER BY sq.${sortField} ${
          sortOrder === "ascend" ? "ASC" : "DESC"
        }`;
      }
    }

    // Count query
    const countQuery = `
      SELECT COUNT(*) as total
      FROM search_query sq
      ${whereSql}
    `;
    const [countResult] = await conn.execute(countQuery, params);
    const total = countResult[0].total;

    // Data query
    const query = `
      SELECT 
        sq.query_id,
        sq.query_text,
        sq.num_results,
        sq.popularity,
        sq.store_id,
        s.name as store_name
      FROM search_query sq
      LEFT JOIN store s ON sq.store_id = s.store_id
      ${whereSql}
      ${orderBy}
      LIMIT ? OFFSET ?
    `;

    params.push(String(pageSize));
    params.push(String(offset));

    const [rows] = await conn.execute(query, params);
    await conn.end();

    res.json({
      items: rows,
      total: total,
    });
  } catch (error) {
    console.error("Search Terms API error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Order Count Report API
app.get("/api/reports/order-count", async (req, res) => {
  try {
    const conn = await getConnection();
    const { from, to, period = "year" } = req.query;

    let dateFormat;
    switch (period) {
      case "month":
        dateFormat = "%Y-%m";
        break;
      case "day":
        dateFormat = "%Y-%m-%d";
        break;
      case "year":
      default:
        dateFormat = "%Y";
        break;
    }

    let whereClause = "";
    const params = [];

    if (from) {
      whereClause += " AND created_at >= ?";
      params.push(from);
    }
    if (to) {
      whereClause += " AND created_at <= ?";
      params.push(to + " 23:59:59");
    }

    const query = `
      SELECT
        DATE_FORMAT(created_at, '${dateFormat}') as period,
        CONCAT(IFNULL(MAX(customer_firstname),''), ' ', IFNULL(MAX(customer_lastname),'')) as customer_name,
        COUNT(*) as orders_count,
        AVG(grand_total) as average_order_value,
        SUM(grand_total) as total_order_value
      FROM sales_order
      WHERE 1=1 ${whereClause}
      GROUP BY period, customer_email
      ORDER BY period DESC, orders_count DESC
    `;

    const [rows] = await conn.execute(query, params);
    await conn.end();

    res.json(rows);
  } catch (error) {
    console.error("Order Count Report API error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Order Total Report API
app.get("/api/reports/order-total", async (req, res) => {
  try {
    const conn = await getConnection();
    const { from, to, period = "year" } = req.query;

    let dateFormat;
    switch (period) {
      case "month":
        dateFormat = "%Y-%m";
        break;
      case "day":
        dateFormat = "%Y-%m-%d";
        break;
      case "year":
      default:
        dateFormat = "%Y";
        break;
    }

    let whereClause = "";
    const params = [];

    if (from) {
      whereClause += " AND created_at >= ?";
      params.push(from);
    }
    if (to) {
      whereClause += " AND created_at <= ?";
      params.push(to + " 23:59:59");
    }

    const query = `
      SELECT
        DATE_FORMAT(created_at, '${dateFormat}') as period,
        CONCAT(IFNULL(MAX(customer_firstname),''), ' ', IFNULL(MAX(customer_lastname),'')) as customer_name,
        COUNT(*) as orders_count,
        AVG(grand_total) as average_order_value,
        SUM(grand_total) as total_order_value
      FROM sales_order
      WHERE 1=1 ${whereClause}
      GROUP BY period, customer_email
      ORDER BY period DESC, total_order_value DESC
    `;

    const [rows] = await conn.execute(query, params);
    await conn.end();

    res.json(rows);
  } catch (error) {
    console.error("Order Total Report API error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Product Reviews Report API
app.get("/api/reports/product-reviews", async (req, res) => {
  try {
    const conn = await getConnection();
    const {
      page = 1,
      pageSize = 20,
      id,
      product,
      reviews_count,
      avg_rating,
      avg_rating_approved,
      last_review_from,
      last_review_to,
    } = req.query;
    const offset = (page - 1) * pageSize;

    // Base query to get aggregated data
    // Note: We need to filter AFTER aggregation for HAVING clause fields (like counts/averages)
    // or use a subquery. Using HAVING is easier for counts/avgs.

    let havingConditions = [];
    let params = [];

    // For WHERE clause (Product ID, Name)
    let whereConditions = [];

    if (id) {
      whereConditions.push("cpe.entity_id = ?");
      params.push(id);
    }
    if (product) {
      whereConditions.push("cpev.value LIKE ?");
      params.push(`%${product}%`);
    }

    // For HAVING clause (Reviews Count, Averages)
    if (reviews_count) {
      havingConditions.push("review_count = ?");
      params.push(reviews_count);
    }
    if (avg_rating) {
      havingConditions.push("ROUND(avg_rating) = ?");
      params.push(avg_rating);
    }
    if (avg_rating_approved) {
      havingConditions.push("ROUND(avg_rating_approved) = ?");
      params.push(avg_rating_approved);
    }
    if (last_review_from) {
      havingConditions.push("last_review >= ?");
      params.push(last_review_from);
    }
    if (last_review_to) {
      havingConditions.push("last_review <= ?");
      params.push(last_review_to + " 23:59:59");
    }

    let whereSql = "";
    if (whereConditions.length > 0) {
      whereSql = "WHERE " + whereConditions.join(" AND ");
    }

    let havingSql = "";
    if (havingConditions.length > 0) {
      havingSql = "HAVING " + havingConditions.join(" AND ");
    }

    // Count Query (Complex due to GROUP BY)
    // We need to count the number of groups that satisfy the condition
    const countQuery = `
      SELECT COUNT(*) as total FROM (
        SELECT 
          cpe.entity_id,
          COUNT(DISTINCT r.review_id) as review_count,
          AVG(rov.percent) as avg_rating,
          AVG(CASE WHEN r.status_id = 1 THEN rov.percent ELSE NULL END) as avg_rating_approved,
          MAX(r.created_at) as last_review
        FROM catalog_product_entity cpe
        JOIN catalog_product_entity_varchar cpev ON cpe.entity_id = cpev.entity_id 
          AND cpev.attribute_id = (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'name' AND entity_type_id = 4)
          AND cpev.store_id = 0
        LEFT JOIN review r ON cpe.entity_id = r.entity_pk_value
        LEFT JOIN rating_option_vote rov ON r.review_id = rov.review_id
        ${whereSql}
        GROUP BY cpe.entity_id
        ${havingSql}
      ) as subquery
    `;

    // Params need to be duplicated for count query because we use them twice (once for count, once for select)
    // Actually, params array contains both WHERE and HAVING params in order.
    // So we can just use it.

    const [countResult] = await conn.execute(countQuery, params);
    const total = countResult[0].total;

    // Data Query
    const query = `
      SELECT 
        cpe.entity_id as product_id,
        MAX(cpev.value) as product_name,
        COUNT(DISTINCT r.review_id) as review_count,
        AVG(rov.percent) as avg_rating,
        AVG(CASE WHEN r.status_id = 1 THEN rov.percent ELSE NULL END) as avg_rating_approved,
        MAX(r.created_at) as last_review
      FROM catalog_product_entity cpe
      JOIN catalog_product_entity_varchar cpev ON cpe.entity_id = cpev.entity_id 
        AND cpev.attribute_id = (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'name' AND entity_type_id = 4)
        AND cpev.store_id = 0
      LEFT JOIN review r ON cpe.entity_id = r.entity_pk_value
      LEFT JOIN rating_option_vote rov ON r.review_id = rov.review_id
      ${whereSql}
      GROUP BY cpe.entity_id
      ${havingSql}
      ORDER BY last_review DESC
      LIMIT ? OFFSET ?
    `;

    const queryParams = [...params, String(pageSize), String(offset)];
    const [rows] = await conn.execute(query, queryParams);
    await conn.end();

    res.json({
      items: rows,
      total: total,
    });
  } catch (error) {
    console.error("Product Reviews Report API error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Customer Reviews Report API
app.get("/api/reports/customer-reviews", async (req, res) => {
  try {
    const conn = await getConnection();
    const { page = 1, pageSize = 20, customer_name, review_count } = req.query;
    const offset = (page - 1) * pageSize;

    let whereSql = "WHERE rd.customer_id IS NOT NULL";
    let havingSql = "";
    const params = [];

    if (customer_name) {
      whereSql +=
        " AND (rd.nickname LIKE ? OR CONCAT(ce.firstname, ' ', ce.lastname) LIKE ?)";
      params.push(`%${customer_name}%`, `%${customer_name}%`);
    }

    if (review_count) {
      havingSql = "HAVING review_count = ?";
      params.push(review_count);
    }

    // Count Query
    const countQuery = `
      SELECT COUNT(*) as total FROM (
        SELECT rd.customer_id, COUNT(rd.review_id) as review_count
        FROM review_detail rd
        LEFT JOIN customer_entity ce ON rd.customer_id = ce.entity_id
        ${whereSql}
        GROUP BY rd.customer_id
        ${havingSql}
      ) as sub
    `;

    const [countResult] = await conn.execute(countQuery, params);
    const total = countResult[0] ? countResult[0].total : 0;

    // Data Query
    const query = `
      SELECT 
        rd.customer_id,
        COALESCE(CONCAT(ce.firstname, ' ', ce.lastname), MAX(rd.nickname)) as customer_name,
        COUNT(rd.review_id) as review_count
      FROM review_detail rd
      LEFT JOIN customer_entity ce ON rd.customer_id = ce.entity_id
      ${whereSql}
      GROUP BY rd.customer_id
      ${havingSql}
      ORDER BY review_count DESC
      LIMIT ? OFFSET ?
    `;

    const queryParams = [...params, String(pageSize), String(offset)];
    const [rows] = await conn.execute(query, queryParams);
    await conn.end();

    res.json({
      items: rows,
      total: total,
    });
  } catch (error) {
    console.error("Customer Reviews Report API error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Sales Orders API
app.get("/api/sales/orders", async (req, res) => {
  try {
    const conn = await getConnection();
    const {
      page = 1,
      pageSize = 20,
      keyword,
      purchase_date_from,
      purchase_date_to,
      base_grand_total_from,
      base_grand_total_to,
      grand_total_from,
      grand_total_to,
      purchase_point,
      increment_id,
      bill_to_name,
      ship_to_name,
      status,
    } = req.query;
    const offset = (page - 1) * pageSize;

    let whereClause = "WHERE 1=1";
    const params = [];

    if (keyword) {
      whereClause += ` AND (
        o.increment_id LIKE ? OR 
        CONCAT(IFNULL(o.customer_firstname,''), ' ', IFNULL(o.customer_lastname,'')) LIKE ?
      )`;
      const kw = `%${keyword}%`;
      params.push(kw, kw);
    }

    if (purchase_date_from) {
      whereClause += " AND o.created_at >= ?";
      params.push(purchase_date_from);
    }
    if (purchase_date_to) {
      whereClause += " AND o.created_at <= ?";
      params.push(purchase_date_to + " 23:59:59");
    }
    if (base_grand_total_from) {
      whereClause += " AND o.base_grand_total >= ?";
      params.push(base_grand_total_from);
    }
    if (base_grand_total_to) {
      whereClause += " AND o.base_grand_total <= ?";
      params.push(base_grand_total_to);
    }
    if (grand_total_from) {
      whereClause += " AND o.grand_total >= ?";
      params.push(grand_total_from);
    }
    if (grand_total_to) {
      whereClause += " AND o.grand_total <= ?";
      params.push(grand_total_to);
    }
    if (purchase_point) {
      whereClause += " AND o.store_name = ?";
      params.push(purchase_point);
    }
    if (increment_id) {
      whereClause += " AND o.increment_id LIKE ?";
      params.push(`%${increment_id}%`);
    }
    if (bill_to_name) {
      whereClause +=
        " AND CONCAT(IFNULL(o.customer_firstname,''), ' ', IFNULL(o.customer_lastname,'')) LIKE ?";
      params.push(`%${bill_to_name}%`);
    }
    if (ship_to_name) {
      whereClause +=
        " AND CONCAT(IFNULL(o.customer_firstname,''), ' ', IFNULL(o.customer_lastname,'')) LIKE ?";
      params.push(`%${ship_to_name}%`);
    }
    if (status) {
      whereClause += " AND o.status = ?";
      params.push(status);
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM sales_order o
      ${whereClause}
    `;
    const [countResult] = await conn.execute(countQuery, params);
    const total = countResult[0].total;

    let orderBy = "ORDER BY o.created_at DESC";
    if (req.query.sortField && req.query.sortOrder) {
      const fieldMap = {
        increment_id: "o.increment_id",
        purchase_point: "purchase_point",
        purchase_date: "o.created_at",
        bill_to_name: "bill_to_name",
        ship_to_name: "ship_to_name",
        base_grand_total: "o.base_grand_total",
        grand_total: "o.grand_total",
        status: "o.status",
        total_item_count: "o.total_item_count",
      };

      const field = fieldMap[req.query.sortField];
      const order = req.query.sortOrder === "ascend" ? "ASC" : "DESC";

      if (field) {
        orderBy = `ORDER BY ${field} ${order}`;
      }
    }

    // Get data
    const query = `
      SELECT 
        o.entity_id,
        o.increment_id,
        o.store_name as purchase_point,
        o.created_at as purchase_date,
        CONCAT(IFNULL(o.customer_firstname,''), ' ', IFNULL(o.customer_lastname,'')) as bill_to_name,
        CONCAT(IFNULL(o.customer_firstname,''), ' ', IFNULL(o.customer_lastname,'')) as ship_to_name,
        o.base_grand_total,
        o.grand_total,
        o.status,
        o.total_item_count
      FROM sales_order o
      ${whereClause}
      ${orderBy}
      LIMIT ? OFFSET ?
    `;

    params.push(String(pageSize));
    params.push(String(offset));

    const [rows] = await conn.execute(query, params);
    await conn.end();

    res.json({
      items: rows,
      total: total,
    });
  } catch (error) {
    console.error("Sales Orders API error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Sales Orders Report API
app.get("/api/reports/sales/orders", async (req, res) => {
  try {
    const conn = await getConnection();
    const { from, to, period = "month", status } = req.query;

    let dateFormat;
    switch (period) {
      case "month":
        dateFormat = "%Y-%m";
        break;
      case "day":
        dateFormat = "%Y-%m-%d";
        break;
      case "year":
      default:
        dateFormat = "%Y";
        break;
    }

    let whereClause = "";
    const params = [];

    if (from) {
      whereClause += " AND created_at >= ?";
      params.push(from);
    }
    if (to) {
      whereClause += " AND created_at <= ?";
      params.push(to + " 23:59:59");
    }
    if (status && status !== "Any") {
      whereClause += " AND status = ?";
      params.push(status);
    }

    const query = `
      SELECT
        DATE_FORMAT(created_at, '${dateFormat}') as period,
        COUNT(*) as orders_count,
        SUM(total_item_count) as sales_items,
        SUM(grand_total) as sales_total,
        SUM(total_invoiced) as invoiced,
        SUM(total_refunded) as refunded,
        SUM(tax_amount) as sales_tax,
        SUM(shipping_amount) as sales_shipping,
        SUM(ABS(discount_amount)) as sales_discount,
        SUM(total_canceled) as canceled
      FROM sales_order
      WHERE 1=1 ${whereClause}
      GROUP BY period
      ORDER BY period ASC
    `;

    const [rows] = await conn.execute(query, params);
    await conn.end();

    res.json(rows);
  } catch (error) {
    console.error("Sales Orders Report API error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Sales Refunds Report API
app.get("/api/reports/sales/refunds", async (req, res) => {
  try {
    const conn = await getConnection();
    const { from, to, period = "day", order_status, empty_rows } = req.query;

    let dateFormat;
    switch (period) {
      case "month":
        dateFormat = "%Y-%m";
        break;
      case "year":
        dateFormat = "%Y";
        break;
      case "day":
      default:
        dateFormat = "%Y-%m-%d";
        break;
    }

    let whereClause = "WHERE 1=1";
    const params = [];

    if (from) {
      whereClause += " AND period >= ?";
      params.push(from);
    }
    if (to) {
      whereClause += " AND period <= ?";
      params.push(to);
    }

    if (order_status && order_status !== "Any") {
      whereClause += " AND order_status = ?";
      params.push(order_status);
    } else {
      // "Applies to Any of the Specified Order Statuses except canceled orders"
      // Assuming 'canceled' is the status code for canceled orders.
      whereClause += " AND order_status != 'canceled'";
    }

    // If empty_rows is 'No' (default), we naturally only get rows that exist in the DB.
    // If 'Yes', we would need to generate a date series, which is complex in MySQL.
    // For now, we'll stick to existing data.

    const query = `
      SELECT
        DATE_FORMAT(period, '${dateFormat}') as period_group,
        SUM(orders_count) as orders_count,
        SUM(refunded) as refunded,
        SUM(online_refunded) as online_refunded,
        SUM(offline_refunded) as offline_refunded
      FROM sales_refunded_aggregated
      ${whereClause}
      GROUP BY period_group
      ORDER BY period_group ASC
    `;

    const [rows] = await conn.execute(query, params);
    await conn.end();

    res.json(rows);
  } catch (error) {
    console.error("Sales Refunds Report API error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Sales Tax Report API
app.get("/api/reports/sales/tax", async (req, res) => {
  try {
    const conn = await getConnection();
    const { from, to, period = "day", order_status } = req.query;

    let dateFormat;
    switch (period) {
      case "month":
        dateFormat = "%Y-%m";
        break;
      case "year":
        dateFormat = "%Y";
        break;
      case "day":
      default:
        dateFormat = "%Y-%m-%d";
        break;
    }

    let whereClause = "WHERE 1=1";
    const params = [];

    if (from) {
      whereClause += " AND period >= ?";
      params.push(from);
    }
    if (to) {
      whereClause += " AND period <= ?";
      params.push(to);
    }

    if (order_status && order_status !== "Any") {
      whereClause += " AND order_status = ?";
      params.push(order_status);
    } else {
      whereClause += " AND order_status != 'canceled'";
    }

    const query = `
      SELECT
        DATE_FORMAT(period, '${dateFormat}') as period_group,
        code as tax_code,
        percent as tax_rate,
        SUM(orders_count) as orders_count,
        SUM(tax_base_amount_sum) as tax_amount
      FROM tax_order_aggregated_created
      ${whereClause}
      GROUP BY period_group, code, percent
      ORDER BY period_group ASC
    `;

    const [rows] = await conn.execute(query, params);
    await conn.end();

    res.json(rows);
  } catch (error) {
    console.error("Sales Tax Report API error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Sales Shipping Report API
app.get("/api/reports/sales/shipping", async (req, res) => {
  try {
    const conn = await getConnection();
    const { from, to, period = "day", order_status } = req.query;

    let dateFormat;
    switch (period) {
      case "month":
        dateFormat = "%Y-%m";
        break;
      case "year":
        dateFormat = "%Y";
        break;
      case "day":
      default:
        dateFormat = "%Y-%m-%d";
        break;
    }

    let whereClause = "WHERE 1=1";
    const params = [];

    if (from) {
      whereClause += " AND period >= ?";
      params.push(from);
    }
    if (to) {
      whereClause += " AND period <= ?";
      params.push(to);
    }

    if (order_status && order_status !== "Any") {
      whereClause += " AND order_status = ?";
      params.push(order_status);
    } else {
      whereClause += " AND order_status != 'canceled'";
    }

    const query = `
      SELECT
        DATE_FORMAT(period, '${dateFormat}') as period_group,
        shipping_description as carrier_method,
        SUM(orders_count) as orders_count,
        SUM(total_shipping) as total_sales_shipping,
        SUM(total_shipping_actual) as total_shipping
      FROM sales_shipping_aggregated
      ${whereClause}
      GROUP BY period_group, shipping_description
      ORDER BY period_group ASC
    `;

    const [rows] = await conn.execute(query, params);
    await conn.end();

    res.json(rows);
  } catch (error) {
    console.error("Sales Shipping Report API error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Product Views Report API
app.get("/api/reports/products/views", async (req, res) => {
  try {
    const conn = await getConnection();
    const { from, to, period = "day", empty_rows } = req.query;

    let dateFormat;
    switch (period) {
      case "month":
        dateFormat = "%Y-%m";
        break;
      case "year":
        dateFormat = "%Y";
        break;
      case "day":
      default:
        dateFormat = "%Y-%m-%d";
        break;
    }

    let whereClause = "WHERE 1=1";
    const params = [];

    if (from) {
      whereClause += " AND period >= ?";
      params.push(from);
    }
    if (to) {
      whereClause += " AND period <= ?";
      params.push(to);
    }

    const query = `
      SELECT
        DATE_FORMAT(period, '${dateFormat}') as period_group,
        product_name,
        product_price as price,
        SUM(views_num) as views
      FROM report_viewed_product_aggregated_daily
      ${whereClause}
      GROUP BY period_group, product_name, product_price
      ORDER BY period_group ASC
    `;

    const [rows] = await conn.execute(query, params);
    await conn.end();

    res.json(rows);
  } catch (error) {
    console.error("Product Views Report API error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Coupons Report API
app.get("/api/reports/sales/coupons", async (req, res) => {
  try {
    const conn = await getConnection();
    const {
      from,
      to,
      period = "day",
      order_status,
      cart_price_rule,
    } = req.query;

    let dateFormat;
    switch (period) {
      case "month":
        dateFormat = "%Y-%m";
        break;
      case "year":
        dateFormat = "%Y";
        break;
      case "day":
      default:
        dateFormat = "%Y-%m-%d";
        break;
    }

    let whereClause = "WHERE 1=1";
    const params = [];

    if (from) {
      whereClause += " AND period >= ?";
      params.push(from);
    }
    if (to) {
      whereClause += " AND period <= ?";
      params.push(to);
    }

    if (order_status && order_status !== "Any") {
      whereClause += " AND order_status = ?";
      params.push(order_status);
    } else {
      whereClause += " AND order_status != 'canceled'";
    }

    if (cart_price_rule && cart_price_rule !== "Any") {
      // Assuming cart_price_rule maps to rule_name or similar
      whereClause += " AND rule_name = ?";
      params.push(cart_price_rule);
    }

    const query = `
      SELECT
        DATE_FORMAT(period, '${dateFormat}') as period_group,
        coupon_code,
        rule_name as price_rule,
        SUM(coupon_uses) as uses,
        SUM(subtotal_amount) as sales_subtotal,
        SUM(discount_amount) as sales_discount,
        SUM(total_amount) as sales_total,
        SUM(subtotal_amount_actual) as subtotal,
        SUM(discount_amount_actual) as discount,
        SUM(total_amount_actual) as total
      FROM salesrule_coupon_aggregated
      ${whereClause}
      GROUP BY period_group, coupon_code, rule_name
      ORDER BY period_group ASC
    `;

    const [rows] = await conn.execute(query, params);
    await conn.end();

    res.json(rows);
  } catch (error) {
    console.error("Coupons Report API error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Bestsellers Report API
app.get("/api/reports/products/bestsellers", async (req, res) => {
  try {
    const conn = await getConnection();
    const { from, to, period = "day" } = req.query;

    const formatDateParam = (dateStr) => {
      if (!dateStr) return dateStr;
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
        const [m, d, y] = dateStr.split("/");
        return `${y}-${m}-${d}`;
      }
      return dateStr;
    };

    let dateFormat;
    switch (period) {
      case "month":
        dateFormat = "%Y-%m";
        break;
      case "year":
        dateFormat = "%Y";
        break;
      case "day":
      default:
        dateFormat = "%Y-%m-%d";
        break;
    }

    let whereClause =
      "WHERE o.status != 'canceled' AND oi.parent_item_id IS NULL";
    const params = [];

    if (from) {
      whereClause += " AND DATE(o.created_at) >= ?";
      params.push(formatDateParam(from));
    }
    if (to) {
      whereClause += " AND DATE(o.created_at) <= ?";
      params.push(formatDateParam(to));
    }

    const query = `
      SELECT
        DATE_FORMAT(o.created_at, '${dateFormat}') as period_group,
        oi.name as product_name,
        oi.price,
        SUM(oi.qty_ordered) as qty_ordered
      FROM sales_order_item oi
      JOIN sales_order o ON oi.order_id = o.entity_id
      ${whereClause}
      GROUP BY period_group, oi.product_id, oi.name, oi.price
      ORDER BY period_group DESC, qty_ordered DESC
    `;

    const [rows] = await conn.execute(query, params);
    await conn.end();

    // Filter to keep only top 5 per period_group
    const filteredRows = [];
    const groupCounts = {};

    for (const row of rows) {
      const group = row.period_group;
      if (!groupCounts[group]) {
        groupCounts[group] = 0;
      }

      if (groupCounts[group] < 5) {
        filteredRows.push(row);
        groupCounts[group]++;
      }
    }

    res.json(filteredRows);
  } catch (error) {
    console.error("Bestsellers Report API error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Sales Invoices API
app.get("/api/sales/invoices", async (req, res) => {
  try {
    const conn = await getConnection();
    const {
      page = 1,
      pageSize = 20,
      keyword,
      invoice_date_from,
      invoice_date_to,
      order_date_from,
      order_date_to,
      base_grand_total_from,
      base_grand_total_to,
      grand_total_from,
      grand_total_to,
      invoice_increment_id,
      order_increment_id,
      bill_to_name,
      status,
    } = req.query;
    const offset = (page - 1) * pageSize;

    let whereClause = "WHERE 1=1";
    const params = [];

    if (keyword) {
      whereClause += ` AND (
        i.increment_id LIKE ? OR 
        o.increment_id LIKE ? OR 
        CONCAT(IFNULL(o.customer_firstname,''), ' ', IFNULL(o.customer_lastname,'')) LIKE ?
      )`;
      const kw = `%${keyword}%`;
      params.push(kw, kw, kw);
    }

    if (invoice_date_from) {
      whereClause += " AND i.created_at >= ?";
      params.push(invoice_date_from);
    }
    if (invoice_date_to) {
      whereClause += " AND i.created_at <= ?";
      params.push(invoice_date_to + " 23:59:59");
    }
    if (order_date_from) {
      whereClause += " AND o.created_at >= ?";
      params.push(order_date_from);
    }
    if (order_date_to) {
      whereClause += " AND o.created_at <= ?";
      params.push(order_date_to + " 23:59:59");
    }
    if (base_grand_total_from) {
      whereClause += " AND i.base_grand_total >= ?";
      params.push(base_grand_total_from);
    }
    if (base_grand_total_to) {
      whereClause += " AND i.base_grand_total <= ?";
      params.push(base_grand_total_to);
    }
    if (grand_total_from) {
      whereClause += " AND i.grand_total >= ?";
      params.push(grand_total_from);
    }
    if (grand_total_to) {
      whereClause += " AND i.grand_total <= ?";
      params.push(grand_total_to);
    }
    if (invoice_increment_id) {
      whereClause += " AND i.increment_id LIKE ?";
      params.push(`%${invoice_increment_id}%`);
    }
    if (order_increment_id) {
      whereClause += " AND o.increment_id LIKE ?";
      params.push(`%${order_increment_id}%`);
    }
    if (bill_to_name) {
      whereClause +=
        " AND CONCAT(IFNULL(o.customer_firstname,''), ' ', IFNULL(o.customer_lastname,'')) LIKE ?";
      params.push(`%${bill_to_name}%`);
    }
    if (status) {
      // Map status string to integer if necessary, or assume string if DB stores string
      // DB schema says 'state' is int.
      // 1: Open, 2: Paid, 3: Canceled
      let stateVal;
      if (status === "Open") stateVal = 1;
      else if (status === "Paid") stateVal = 2;
      else if (status === "Canceled") stateVal = 3;

      if (stateVal) {
        whereClause += " AND i.state = ?";
        params.push(stateVal);
      }
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM sales_invoice i
      LEFT JOIN sales_order o ON i.order_id = o.entity_id
      ${whereClause}
    `;
    const [countResult] = await conn.execute(countQuery, params);
    const total = countResult[0].total;

    // Get data
    const query = `
      SELECT 
        i.entity_id,
        i.increment_id as invoice_increment_id,
        i.created_at as invoice_created_at,
        o.increment_id as order_increment_id,
        o.created_at as order_created_at,
        CONCAT(IFNULL(o.customer_firstname,''), ' ', IFNULL(o.customer_lastname,'')) as bill_to_name,
        CASE i.state
          WHEN 1 THEN 'Open'
          WHEN 2 THEN 'Paid'
          WHEN 3 THEN 'Canceled'
          ELSE 'Unknown'
        END as status,
        i.base_grand_total,
        i.grand_total
      FROM sales_invoice i
      LEFT JOIN sales_order o ON i.order_id = o.entity_id
      ${whereClause}
      ORDER BY i.created_at DESC
      LIMIT ? OFFSET ?
    `;

    params.push(String(pageSize));
    params.push(String(offset));

    const [rows] = await conn.execute(query, params);
    await conn.end();

    res.json({
      items: rows,
      total: total,
    });
  } catch (error) {
    console.error("Sales Invoices API error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Sales Shipments API
app.get("/api/sales/shipments", async (req, res) => {
  try {
    const conn = await getConnection();
    const {
      page = 1,
      pageSize = 20,
      keyword,
      ship_date_from,
      ship_date_to,
      order_date_from,
      order_date_to,
      total_qty_from,
      total_qty_to,
      shipment_increment_id,
      order_increment_id,
      ship_to_name,
    } = req.query;
    const offset = (page - 1) * pageSize;

    let whereClause = "WHERE 1=1";
    const params = [];

    if (keyword) {
      whereClause += ` AND (
        s.increment_id LIKE ? OR 
        o.increment_id LIKE ? OR 
        CONCAT(IFNULL(o.customer_firstname,''), ' ', IFNULL(o.customer_lastname,'')) LIKE ?
      )`;
      const kw = `%${keyword}%`;
      params.push(kw, kw, kw);
    }

    if (ship_date_from) {
      whereClause += " AND s.created_at >= ?";
      params.push(ship_date_from);
    }
    if (ship_date_to) {
      whereClause += " AND s.created_at <= ?";
      params.push(ship_date_to + " 23:59:59");
    }
    if (order_date_from) {
      whereClause += " AND o.created_at >= ?";
      params.push(order_date_from);
    }
    if (order_date_to) {
      whereClause += " AND o.created_at <= ?";
      params.push(order_date_to + " 23:59:59");
    }
    if (total_qty_from) {
      whereClause += " AND s.total_qty >= ?";
      params.push(total_qty_from);
    }
    if (total_qty_to) {
      whereClause += " AND s.total_qty <= ?";
      params.push(total_qty_to);
    }
    if (shipment_increment_id) {
      whereClause += " AND s.increment_id LIKE ?";
      params.push(`%${shipment_increment_id}%`);
    }
    if (order_increment_id) {
      whereClause += " AND o.increment_id LIKE ?";
      params.push(`%${order_increment_id}%`);
    }
    if (ship_to_name) {
      // Using order customer name as proxy for ship-to name for now
      whereClause +=
        " AND CONCAT(IFNULL(o.customer_firstname,''), ' ', IFNULL(o.customer_lastname,'')) LIKE ?";
      params.push(`%${ship_to_name}%`);
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM sales_shipment s
      LEFT JOIN sales_order o ON s.order_id = o.entity_id
      ${whereClause}
    `;
    const [countResult] = await conn.execute(countQuery, params);
    const total = countResult[0].total;

    // Get data
    const query = `
      SELECT 
        s.entity_id,
        s.increment_id as shipment_increment_id,
        s.created_at as ship_date,
        o.increment_id as order_increment_id,
        o.created_at as order_created_at,
        CONCAT(IFNULL(o.customer_firstname,''), ' ', IFNULL(o.customer_lastname,'')) as ship_to_name,
        s.total_qty
      FROM sales_shipment s
      LEFT JOIN sales_order o ON s.order_id = o.entity_id
      ${whereClause}
      ORDER BY s.created_at DESC
      LIMIT ? OFFSET ?
    `;

    params.push(String(pageSize));
    params.push(String(offset));

    const [rows] = await conn.execute(query, params);
    await conn.end();

    res.json({
      items: rows,
      total: total,
    });
  } catch (error) {
    console.error("Sales Shipments API error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Sales Credit Memos API
app.get("/api/sales/credit-memos", async (req, res) => {
  try {
    const conn = await getConnection();
    const {
      page = 1,
      pageSize = 20,
      keyword,
      created_at_from,
      created_at_to,
      order_date_from,
      order_date_to,
      refunded_from,
      refunded_to,
      creditmemo_increment_id,
      order_increment_id,
      bill_to_name,
      status,
    } = req.query;
    const offset = (page - 1) * pageSize;

    let whereClause = "WHERE 1=1";
    const params = [];

    if (keyword) {
      whereClause += ` AND (
        c.increment_id LIKE ? OR 
        o.increment_id LIKE ? OR 
        CONCAT(IFNULL(o.customer_firstname,''), ' ', IFNULL(o.customer_lastname,'')) LIKE ?
      )`;
      const kw = `%${keyword}%`;
      params.push(kw, kw, kw);
    }

    if (created_at_from) {
      whereClause += " AND c.created_at >= ?";
      params.push(created_at_from);
    }
    if (created_at_to) {
      whereClause += " AND c.created_at <= ?";
      params.push(created_at_to + " 23:59:59");
    }
    if (order_date_from) {
      whereClause += " AND o.created_at >= ?";
      params.push(order_date_from);
    }
    if (order_date_to) {
      whereClause += " AND o.created_at <= ?";
      params.push(order_date_to + " 23:59:59");
    }
    if (refunded_from) {
      whereClause += " AND c.grand_total >= ?";
      params.push(refunded_from);
    }
    if (refunded_to) {
      whereClause += " AND c.grand_total <= ?";
      params.push(refunded_to);
    }
    if (creditmemo_increment_id) {
      whereClause += " AND c.increment_id LIKE ?";
      params.push(`%${creditmemo_increment_id}%`);
    }
    if (order_increment_id) {
      whereClause += " AND o.increment_id LIKE ?";
      params.push(`%${order_increment_id}%`);
    }
    if (bill_to_name) {
      whereClause +=
        " AND CONCAT(IFNULL(o.customer_firstname,''), ' ', IFNULL(o.customer_lastname,'')) LIKE ?";
      params.push(`%${bill_to_name}%`);
    }
    if (status) {
      // Map status string to integer if necessary
      // 1: Pending, 2: Refunded, 3: Canceled (Example mapping, need to verify if needed)
      // Assuming 'Refunded' is a common state.
      // Let's assume status is passed as string and we might need to map or it matches if we join with status table.
      // But here 'state' is int.
      // Let's assume 2 is Refunded for now based on typical Magento.
      let stateVal;
      if (status === "Refunded") stateVal = 2;
      else if (status === "Pending") stateVal = 1;

      if (stateVal) {
        whereClause += " AND c.state = ?";
        params.push(stateVal);
      }
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM sales_creditmemo c
      LEFT JOIN sales_order o ON c.order_id = o.entity_id
      ${whereClause}
    `;
    const [countResult] = await conn.execute(countQuery, params);
    const total = countResult[0].total;

    // Get data
    const query = `
      SELECT 
        c.entity_id,
        c.increment_id as creditmemo_increment_id,
        c.created_at as created_at,
        o.increment_id as order_increment_id,
        o.created_at as order_created_at,
        CONCAT(IFNULL(o.customer_firstname,''), ' ', IFNULL(o.customer_lastname,'')) as bill_to_name,
        CASE c.state
          WHEN 1 THEN 'Pending'
          WHEN 2 THEN 'Refunded'
          WHEN 3 THEN 'Canceled'
          ELSE 'Unknown'
        END as status,
        c.grand_total as refunded
      FROM sales_creditmemo c
      LEFT JOIN sales_order o ON c.order_id = o.entity_id
      ${whereClause}
      ORDER BY c.created_at DESC
      LIMIT ? OFFSET ?
    `;

    params.push(String(pageSize));
    params.push(String(offset));

    const [rows] = await conn.execute(query, params);
    await conn.end();

    res.json({
      items: rows,
      total: total,
    });
  } catch (error) {
    console.error("Sales Credit Memos API error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Sales Orders Report API
app.get("/api/reports/sales/orders", async (req, res) => {
  try {
    const conn = await getConnection();
    const { from, to, period = "year", status } = req.query;

    let dateFormat;
    switch (period) {
      case "month":
        dateFormat = "%Y-%m";
        break;
      case "day":
        dateFormat = "%Y-%m-%d";
        break;
      case "year":
      default:
        dateFormat = "%Y";
        break;
    }

    let whereClause = "";
    const params = [];

    if (from) {
      whereClause += " AND created_at >= ?";
      params.push(from);
    }
    if (to) {
      whereClause += " AND created_at <= ?";
      params.push(to + " 23:59:59");
    }

    if (status && status !== "Any") {
      whereClause += " AND status = ?";
      params.push(status);
    } else {
      // If status is Any (or not provided), exclude canceled orders?
      // The UI says "Applies to Any of the Specified Order Statuses except canceled orders"
      // This usually means if "Any" is selected, we exclude canceled.
      // But if "Canceled" is selected explicitly, we show them.
      // Let's assume "Any" means status != 'canceled'
      whereClause += " AND status != 'canceled'";
    }

    const query = `
      SELECT
        DATE_FORMAT(created_at, '${dateFormat}') as period,
        COUNT(*) as orders_count,
        SUM(total_item_count) as sales_items,
        SUM(grand_total) as sales_total,
        SUM(total_invoiced) as invoiced,
        SUM(total_refunded) as refunded,
        SUM(tax_amount) as sales_tax,
        SUM(shipping_amount) as sales_shipping,
        SUM(ABS(discount_amount)) as sales_discount,
        SUM(total_canceled) as canceled
      FROM sales_order
      WHERE 1=1 ${whereClause}
      GROUP BY period
      ORDER BY period DESC
    `;

    const [rows] = await conn.execute(query, params);
    await conn.end();

    res.json(rows);
  } catch (error) {
    console.error("Sales Orders Report API error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Customers API
app.get("/api/customers", async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 20,
      created_at_from,
      created_at_to,
      name,
      email,
      group_id,
      billing_telephone,
      billing_postcode,
      billing_country_id,
      billing_region,
    } = req.query;

    const offset = (page - 1) * pageSize;
    const conn = await getConnection();

    let whereClause = "";
    const params = [];

    if (created_at_from) {
      whereClause += " AND c.created_at >= ?";
      params.push(created_at_from);
    }
    if (created_at_to) {
      whereClause += " AND c.created_at <= ?";
      params.push(created_at_to);
    }
    if (name) {
      whereClause += " AND c.name LIKE ?";
      params.push(`%${name}%`);
    }
    if (email) {
      whereClause += " AND c.email LIKE ?";
      params.push(`%${email}%`);
    }
    if (group_id) {
      whereClause += " AND c.group_id = ?";
      params.push(group_id);
    }
    if (billing_telephone) {
      whereClause += " AND c.billing_telephone LIKE ?";
      params.push(`%${billing_telephone}%`);
    }
    if (billing_postcode) {
      whereClause += " AND c.billing_postcode LIKE ?";
      params.push(`%${billing_postcode}%`);
    }
    if (billing_country_id) {
      whereClause += " AND c.billing_country_id = ?";
      params.push(billing_country_id);
    }
    if (billing_region) {
      whereClause += " AND c.billing_region LIKE ?";
      params.push(`%${billing_region}%`);
    }

    const countQuery = `
      SELECT COUNT(*) as total
      FROM customer_grid_flat c
      WHERE 1=1 ${whereClause}
    `;
    const [countResult] = await conn.execute(countQuery, params);
    const total = countResult[0].total;

    const query = `
      SELECT c.*, g.customer_group_code
      FROM customer_grid_flat c
      LEFT JOIN customer_group g ON c.group_id = g.customer_group_id
      WHERE 1=1 ${whereClause}
      ORDER BY c.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const queryParams = [...params, String(pageSize), String(offset)];

    const [rows] = await conn.execute(query, queryParams);
    await conn.end();

    res.json({
      items: rows,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  } catch (error) {
    console.error("Customers API error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Customer Groups API
app.get("/api/customer-groups", async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 20,
      customer_group_id_from,
      customer_group_id_to,
      customer_group_code,
      tax_class_id,
    } = req.query;

    const offset = (page - 1) * pageSize;
    const conn = await getConnection();

    let whereClause = "";
    const params = [];

    if (customer_group_id_from) {
      whereClause += " AND customer_group_id >= ?";
      params.push(customer_group_id_from);
    }
    if (customer_group_id_to) {
      whereClause += " AND customer_group_id <= ?";
      params.push(customer_group_id_to);
    }
    if (customer_group_code) {
      whereClause += " AND customer_group_code LIKE ?";
      params.push(`%${customer_group_code}%`);
    }
    if (tax_class_id) {
      whereClause += " AND tax_class_id = ?";
      params.push(tax_class_id);
    }

    const countQuery = `
      SELECT COUNT(*) as total
      FROM customer_group
      WHERE 1=1 ${whereClause}
    `;
    const [countResult] = await conn.execute(countQuery, params);
    const total = countResult[0].total;

    const query = `
      SELECT *
      FROM customer_group
      WHERE 1=1 ${whereClause}
      ORDER BY customer_group_id ASC
      LIMIT ? OFFSET ?
    `;

    const queryParams = [...params, String(pageSize), String(offset)];

    const [rows] = await conn.execute(query, queryParams);
    await conn.end();

    res.json({
      items: rows,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  } catch (error) {
    console.error("Customer Groups API error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Catalog Products API
app.get("/api/catalog/products", async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 20,
      id_from,
      id_to,
      price_from,
      price_to,
      qty_from,
      qty_to,
      name,
      sku,
      status,
      visibility,
      type_id,
      updated_at_from,
      updated_at_to,
    } = req.query;

    const offset = (page - 1) * pageSize;
    const conn = await getConnection();

    let whereClause = "";
    const params = [];

    if (id_from) {
      whereClause += " AND e.entity_id >= ?";
      params.push(id_from);
    }
    if (id_to) {
      whereClause += " AND e.entity_id <= ?";
      params.push(id_to);
    }
    if (price_from) {
      whereClause += " AND at_price.value >= ?";
      params.push(price_from);
    }
    if (price_to) {
      whereClause += " AND at_price.value <= ?";
      params.push(price_to);
    }
    if (qty_from) {
      whereClause += " AND stock.qty >= ?";
      params.push(qty_from);
    }
    if (qty_to) {
      whereClause += " AND stock.qty <= ?";
      params.push(qty_to);
    }
    if (name) {
      whereClause += " AND at_name.value LIKE ?";
      params.push(`%${name}%`);
    }
    if (sku) {
      whereClause += " AND e.sku LIKE ?";
      params.push(`%${sku}%`);
    }
    if (status) {
      whereClause += " AND at_status.value = ?";
      params.push(status);
    }
    if (visibility) {
      whereClause += " AND at_visibility.value = ?";
      params.push(visibility);
    }
    if (type_id) {
      whereClause += " AND e.type_id = ?";
      params.push(type_id);
    }
    if (updated_at_from) {
      whereClause += " AND e.updated_at >= ?";
      params.push(updated_at_from);
    }
    if (updated_at_to) {
      whereClause += " AND e.updated_at <= ?";
      params.push(updated_at_to);
    }

    const baseQuery = `
      FROM catalog_product_entity AS e
      LEFT JOIN catalog_product_entity_varchar AS at_name
        ON at_name.entity_id = e.entity_id AND at_name.attribute_id = 73 AND at_name.store_id = 0
      LEFT JOIN catalog_product_entity_decimal AS at_price
        ON at_price.entity_id = e.entity_id AND at_price.attribute_id = 77 AND at_price.store_id = 0
      LEFT JOIN catalog_product_entity_int AS at_status
        ON at_status.entity_id = e.entity_id AND at_status.attribute_id = 97 AND at_status.store_id = 0
      LEFT JOIN catalog_product_entity_int AS at_visibility
        ON at_visibility.entity_id = e.entity_id AND at_visibility.attribute_id = 99 AND at_visibility.store_id = 0
      LEFT JOIN catalog_product_entity_varchar AS at_thumbnail
        ON at_thumbnail.entity_id = e.entity_id AND at_thumbnail.attribute_id = 89 AND at_thumbnail.store_id = 0
      LEFT JOIN cataloginventory_stock_item AS stock
        ON stock.product_id = e.entity_id
      LEFT JOIN eav_attribute_set AS aset
        ON aset.attribute_set_id = e.attribute_set_id
      WHERE 1=1 ${whereClause}
    `;

    const countQuery = `SELECT COUNT(*) as total ${baseQuery}`;
    const [countResult] = await conn.execute(countQuery, params);
    const total = countResult[0].total;

    const query = `
      SELECT
        e.entity_id,
        e.sku,
        e.type_id,
        e.attribute_set_id,
        e.updated_at,
        at_name.value AS name,
        at_price.value AS price,
        at_status.value AS status,
        at_visibility.value AS visibility,
        at_thumbnail.value AS thumbnail,
        stock.qty AS quantity,
        aset.attribute_set_name
      ${baseQuery}
      ORDER BY e.entity_id DESC
      LIMIT ? OFFSET ?
    `;

    const queryParams = [...params, String(pageSize), String(offset)];

    const [rows] = await conn.execute(query, queryParams);
    await conn.end();

    res.json({
      items: rows,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  } catch (error) {
    console.error("Catalog Products API error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Marketing: Catalog Price Rules
app.get("/api/marketing/catalog-rules", async (req, res) => {
  try {
    const conn = await getConnection();
    const { page = 1, pageSize = 20, rule_id, name, is_active } = req.query;
    const offset = (page - 1) * pageSize;

    let whereClause = "";
    const params = [];

    if (rule_id) {
      whereClause += " AND rule_id = ?";
      params.push(rule_id);
    }
    if (name) {
      whereClause += " AND name LIKE ?";
      params.push(`%${name}%`);
    }
    if (is_active) {
      whereClause += " AND is_active = ?";
      params.push(is_active);
    }

    const countQuery = `SELECT COUNT(*) as total FROM catalogrule WHERE 1=1 ${whereClause}`;
    const [countResult] = await conn.execute(countQuery, params);
    const total = countResult[0].total;

    const query = `
      SELECT * FROM catalogrule 
      WHERE 1=1 ${whereClause}
      ORDER BY rule_id DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await conn.execute(query, [
      ...params,
      String(pageSize),
      String(offset),
    ]);
    await conn.end();

    res.json({ items: rows, total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Marketing: Cart Price Rules
app.get("/api/marketing/cart-rules", async (req, res) => {
  try {
    const conn = await getConnection();
    const { page = 1, pageSize = 20, rule_id, name, is_active } = req.query;
    const offset = (page - 1) * pageSize;

    let whereClause = "";
    const params = [];

    if (rule_id) {
      whereClause += " AND rule_id = ?";
      params.push(rule_id);
    }
    if (name) {
      whereClause += " AND name LIKE ?";
      params.push(`%${name}%`);
    }
    if (is_active) {
      whereClause += " AND is_active = ?";
      params.push(is_active);
    }

    const countQuery = `SELECT COUNT(*) as total FROM salesrule WHERE 1=1 ${whereClause}`;
    const [countResult] = await conn.execute(countQuery, params);
    const total = countResult[0].total;

    const query = `
      SELECT * FROM salesrule 
      WHERE 1=1 ${whereClause}
      ORDER BY rule_id DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await conn.execute(query, [
      ...params,
      String(pageSize),
      String(offset),
    ]);
    await conn.end();

    res.json({ items: rows, total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Marketing: Newsletter Subscribers
app.get("/api/marketing/newsletter-subscribers", async (req, res) => {
  try {
    const conn = await getConnection();
    const {
      page = 1,
      pageSize = 20,
      subscriber_id,
      subscriber_email,
      subscriber_status,
    } = req.query;
    const offset = (page - 1) * pageSize;

    let whereClause = "";
    const params = [];

    if (subscriber_id) {
      whereClause += " AND main_table.subscriber_id = ?";
      params.push(subscriber_id);
    }
    if (subscriber_email) {
      whereClause += " AND main_table.subscriber_email LIKE ?";
      params.push(`%${subscriber_email}%`);
    }
    if (subscriber_status) {
      whereClause += " AND main_table.subscriber_status = ?";
      params.push(subscriber_status);
    }

    const baseQuery = `
        FROM newsletter_subscriber AS main_table
        LEFT JOIN customer_entity AS ce ON main_table.customer_id = ce.entity_id
        WHERE 1=1 ${whereClause}
    `;

    const countQuery = `SELECT COUNT(*) as total ${baseQuery}`;
    const [countResult] = await conn.execute(countQuery, params);
    const total = countResult[0].total;

    const query = `
        SELECT 
            main_table.*,
            CONCAT(ce.firstname, ' ', ce.lastname) as customer_name
        ${baseQuery}
        ORDER BY main_table.subscriber_id DESC
        LIMIT ? OFFSET ?
    `;

    const [rows] = await conn.execute(query, [
      ...params,
      String(pageSize),
      String(offset),
    ]);
    await conn.end();

    res.json({ items: rows, total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Marketing: URL Rewrites
app.get("/api/marketing/url-rewrites", async (req, res) => {
  try {
    const conn = await getConnection();
    const {
      page = 1,
      pageSize = 20,
      url_rewrite_id,
      request_path,
      target_path,
    } = req.query;
    const offset = (page - 1) * pageSize;

    let whereClause = "";
    const params = [];

    if (url_rewrite_id) {
      whereClause += " AND url_rewrite_id = ?";
      params.push(url_rewrite_id);
    }
    if (request_path) {
      whereClause += " AND request_path LIKE ?";
      params.push(`%${request_path}%`);
    }
    if (target_path) {
      whereClause += " AND target_path LIKE ?";
      params.push(`%${target_path}%`);
    }

    const countQuery = `SELECT COUNT(*) as total FROM url_rewrite WHERE 1=1 ${whereClause}`;
    const [countResult] = await conn.execute(countQuery, params);
    const total = countResult[0].total;

    const query = `
      SELECT * FROM url_rewrite 
      WHERE 1=1 ${whereClause}
      ORDER BY url_rewrite_id DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await conn.execute(query, [
      ...params,
      String(pageSize),
      String(offset),
    ]);
    await conn.end();

    res.json({ items: rows, total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Marketing: Search Terms
app.get("/api/marketing/search-terms", async (req, res) => {
  try {
    const conn = await getConnection();
    const { page = 1, pageSize = 20, query_text } = req.query;
    const offset = (page - 1) * pageSize;

    let whereClause = "";
    const params = [];

    if (query_text) {
      whereClause += " AND query_text LIKE ?";
      params.push(`%${query_text}%`);
    }

    const countQuery = `SELECT COUNT(*) as total FROM search_query WHERE 1=1 ${whereClause}`;
    const [countResult] = await conn.execute(countQuery, params);
    const total = countResult[0].total;

    const query = `
      SELECT * FROM search_query 
      WHERE 1=1 ${whereClause}
      ORDER BY query_id DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await conn.execute(query, [
      ...params,
      String(pageSize),
      String(offset),
    ]);
    await conn.end();

    res.json({ items: rows, total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Content: Pages
app.get("/api/content/pages", async (req, res) => {
  try {
    const conn = await getConnection();
    const { page = 1, pageSize = 20, title, identifier, is_active } = req.query;
    const offset = (page - 1) * pageSize;

    let whereClause = "";
    const params = [];

    if (title) {
      whereClause += " AND title LIKE ?";
      params.push(`%${title}%`);
    }
    if (identifier) {
      whereClause += " AND identifier LIKE ?";
      params.push(`%${identifier}%`);
    }
    if (is_active) {
      whereClause += " AND is_active = ?";
      params.push(is_active);
    }

    const countQuery = `SELECT COUNT(*) as total FROM cms_page WHERE 1=1 ${whereClause}`;
    const [countResult] = await conn.execute(countQuery, params);
    const total = countResult[0].total;

    const query = `
      SELECT * FROM cms_page 
      WHERE 1=1 ${whereClause}
      ORDER BY page_id DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await conn.execute(query, [
      ...params,
      String(pageSize),
      String(offset),
    ]);
    await conn.end();

    res.json({ items: rows, total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get Single Page
app.get("/api/content/pages/:id", async (req, res) => {
  try {
    const conn = await getConnection();
    const [rows] = await conn.execute(
      "SELECT * FROM cms_page WHERE page_id = ?",
      [req.params.id]
    );
    await conn.end();
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ error: "Page not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Update Page
app.post("/api/content/pages/:id", async (req, res) => {
  try {
    const conn = await getConnection();
    const { title, content_heading, content, is_active, identifier } = req.body;
    await conn.execute(
      "UPDATE cms_page SET title = ?, content_heading = ?, content = ?, is_active = ?, identifier = ? WHERE page_id = ?",
      [title, content_heading, content, is_active, identifier, req.params.id]
    );
    await conn.end();
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Content: Blocks
app.get("/api/content/blocks", async (req, res) => {
  try {
    const conn = await getConnection();
    const { page = 1, pageSize = 20, title, identifier, is_active } = req.query;
    const offset = (page - 1) * pageSize;

    let whereClause = "";
    const params = [];

    if (title) {
      whereClause += " AND title LIKE ?";
      params.push(`%${title}%`);
    }
    if (identifier) {
      whereClause += " AND identifier LIKE ?";
      params.push(`%${identifier}%`);
    }
    if (is_active) {
      whereClause += " AND is_active = ?";
      params.push(is_active);
    }

    const countQuery = `SELECT COUNT(*) as total FROM cms_block WHERE 1=1 ${whereClause}`;
    const [countResult] = await conn.execute(countQuery, params);
    const total = countResult[0].total;

    const query = `
      SELECT * FROM cms_block 
      WHERE 1=1 ${whereClause}
      ORDER BY block_id DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await conn.execute(query, [
      ...params,
      String(pageSize),
      String(offset),
    ]);
    await conn.end();

    res.json({ items: rows, total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Content: Widgets
app.get("/api/content/widgets", async (req, res) => {
  try {
    const conn = await getConnection();
    const { page = 1, pageSize = 20, title } = req.query;
    const offset = (page - 1) * pageSize;

    let whereClause = "";
    const params = [];

    if (title) {
      whereClause += " AND main_table.title LIKE ?";
      params.push(`%${title}%`);
    }

    const baseQuery = `
      FROM widget_instance AS main_table
      LEFT JOIN theme AS t ON main_table.theme_id = t.theme_id
      WHERE 1=1 ${whereClause}
    `;

    const countQuery = `SELECT COUNT(*) as total ${baseQuery}`;
    const [countResult] = await conn.execute(countQuery, params);
    const total = countResult[0].total;

    const query = `
      SELECT main_table.*, t.theme_title 
      ${baseQuery}
      ORDER BY main_table.instance_id DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await conn.execute(query, [
      ...params,
      String(pageSize),
      String(offset),
    ]);
    await conn.end();

    res.json({ items: rows, total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Content: Design Configuration
app.get("/api/content/design-config", async (req, res) => {
  try {
    const conn = await getConnection();
    const { page = 1, pageSize = 20 } = req.query;
    const offset = (page - 1) * pageSize;

    // design_config_grid_flat might not have many filterable columns easily accessible or needed for basic list
    // It usually links store/website to theme.

    const countQuery = `SELECT COUNT(*) as total FROM design_config_grid_flat`;
    const [countResult] = await conn.execute(countQuery);
    const total = countResult[0].total;

    const query = `
      SELECT * FROM design_config_grid_flat 
      ORDER BY entity_id DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await conn.execute(query, [
      String(pageSize),
      String(offset),
    ]);
    await conn.end();

    res.json({ items: rows, total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Content: Themes
app.get("/api/content/themes", async (req, res) => {
  try {
    const conn = await getConnection();
    const { page = 1, pageSize = 20, theme_title } = req.query;
    const offset = (page - 1) * pageSize;

    let whereClause = "";
    const params = [];

    if (theme_title) {
      whereClause += " AND theme_title LIKE ?";
      params.push(`%${theme_title}%`);
    }

    const countQuery = `SELECT COUNT(*) as total FROM theme WHERE 1=1 ${whereClause}`;
    const [countResult] = await conn.execute(countQuery, params);
    const total = countResult[0].total;

    const query = `
      SELECT * FROM theme 
      WHERE 1=1 ${whereClause}
      ORDER BY theme_id DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await conn.execute(query, [
      ...params,
      String(pageSize),
      String(offset),
    ]);
    await conn.end();

    res.json({ items: rows, total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Catalog Product Detail API
app.get("/api/catalog/product/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const conn = await getConnection();

    // Fetch basic product data
    const [productRows] = await conn.execute(
      "SELECT * FROM catalog_product_entity WHERE entity_id = ?",
      [id]
    );

    if (productRows.length === 0) {
      await conn.end();
      return res.status(404).json({ error: "Product not found" });
    }

    const product = productRows[0];

    // Helper function to fetch attribute values
    const fetchAttributeValue = async (attributeCode, tableName) => {
      const [rows] = await conn.execute(
        `
        SELECT v.value
        FROM ${tableName} v
        JOIN eav_attribute a ON v.attribute_id = a.attribute_id
        WHERE v.entity_id = ? AND a.attribute_code = ? AND v.store_id = 0
      `,
        [id, attributeCode]
      );
      return rows.length > 0 ? rows[0].value : null;
    };

    // Fetch standard attributes
    product.name = await fetchAttributeValue(
      "name",
      "catalog_product_entity_varchar"
    );
    product.price = await fetchAttributeValue(
      "price",
      "catalog_product_entity_decimal"
    );
    product.status = await fetchAttributeValue(
      "status",
      "catalog_product_entity_int"
    );
    product.visibility = await fetchAttributeValue(
      "visibility",
      "catalog_product_entity_int"
    );
    product.weight = await fetchAttributeValue(
      "weight",
      "catalog_product_entity_decimal"
    );
    product.tax_class_id = await fetchAttributeValue(
      "tax_class_id",
      "catalog_product_entity_int"
    );
    product.description = await fetchAttributeValue(
      "description",
      "catalog_product_entity_text"
    );
    product.short_description = await fetchAttributeValue(
      "short_description",
      "catalog_product_entity_text"
    );
    product.meta_title = await fetchAttributeValue(
      "meta_title",
      "catalog_product_entity_varchar"
    );
    product.meta_keyword = await fetchAttributeValue(
      "meta_keyword",
      "catalog_product_entity_text"
    );
    product.meta_description = await fetchAttributeValue(
      "meta_description",
      "catalog_product_entity_varchar"
    );

    // Fetch custom attributes shown in screenshot
    product.style_bottom = await fetchAttributeValue(
      "style_bottom",
      "catalog_product_entity_text"
    ); // Assuming text/varchar
    product.activity = await fetchAttributeValue(
      "activity",
      "catalog_product_entity_text"
    );
    product.material = await fetchAttributeValue(
      "material",
      "catalog_product_entity_text"
    );
    product.pattern = await fetchAttributeValue(
      "pattern",
      "catalog_product_entity_text"
    );
    product.climate = await fetchAttributeValue(
      "climate",
      "catalog_product_entity_text"
    );

    // Fetch inventory
    const [stockRows] = await conn.execute(
      "SELECT qty, is_in_stock FROM cataloginventory_stock_item WHERE product_id = ?",
      [id]
    );
    if (stockRows.length > 0) {
      product.quantity = stockRows[0].qty;
      product.stock_status = stockRows[0].is_in_stock;
    }

    await conn.end();
    res.json(product);
  } catch (error) {
    console.error("Product Detail API error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Search Terms Report API
app.get("/api/search-terms", async (req, res) => {
  try {
    const conn = await getConnection();
    const {
      page = 1,
      pageSize = 20,
      query_text,
      store_id,
      num_results_from,
      num_results_to,
      popularity_from,
      popularity_to,
    } = req.query;

    const offset = (page - 1) * pageSize;
    const limit = parseInt(pageSize);

    let sql = "SELECT * FROM search_query WHERE 1=1";
    const params = [];

    if (query_text) {
      sql += " AND query_text LIKE ?";
      params.push(`%${query_text}%`);
    }

    if (store_id) {
      sql += " AND store_id = ?";
      params.push(store_id);
    }

    if (num_results_from) {
      sql += " AND num_results >= ?";
      params.push(num_results_from);
    }
    if (num_results_to) {
      sql += " AND num_results <= ?";
      params.push(num_results_to);
    }

    if (popularity_from) {
      sql += " AND popularity >= ?";
      params.push(popularity_from);
    }
    if (popularity_to) {
      sql += " AND popularity <= ?";
      params.push(popularity_to);
    }

    // Count total
    const [countRows] = await conn.execute(
      `SELECT COUNT(*) as total FROM (${sql.replace(
        "SELECT *",
        "SELECT 1"
      )}) as c`,
      params
    );
    const total = countRows[0].total;

    // Fetch data
    sql += " ORDER BY query_id DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const [rows] = await conn.execute(sql, params);

    await conn.end();

    res.json({
      items: rows,
      total: total,
    });
  } catch (error) {
    console.error("Search Terms API error:", error);
    res.status(500).json({ error: error.message });
  }
});

console.log("Attempting to start server...");
app.listen(port, process.env.API_HOST || '127.0.0.1', "127.0.0.1", (err) => {
  if (err) {
    console.error("Error starting server:", err);
    return;
  }
  console.log(`Server running at http://localhost:${port}`);
});
