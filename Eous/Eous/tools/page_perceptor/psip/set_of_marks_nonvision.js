// accessibility mode

let labels = [];

// --- 辅助函数：获取元素矩形 ---
function getElementRects(element) {
  const vw = Math.max(
    document.documentElement.clientWidth || 0,
    window.innerWidth || 0,
  );
  const vh = Math.max(
    document.documentElement.clientHeight || 0,
    window.innerHeight || 0,
  );

  const bb = element.getBoundingClientRect();

  // 如果元素不可见或宽高为 0，跳过
  if (bb.width <= 0 || bb.height <= 0) return [];

  const cx = bb.left + bb.width / 2;
  const cy = bb.top + bb.height / 2;
  const elAtCenter = document.elementFromPoint(cx, cy);

  // 只保留该元素本身（排除子元素）
  if (elAtCenter !== element && !element.contains(elAtCenter)) return [];

  const rect = {
    left: Math.max(0, bb.left),
    top: Math.max(0, bb.top),
    right: Math.min(vw, bb.right),
    bottom: Math.min(vh, bb.bottom),
  };
  return [
    { ...rect, width: rect.right - rect.left, height: rect.bottom - rect.top },
  ];
}

// --- 筛选可交互元素 ---
function getInteractiveElements() {
  let items = Array.from(
    document.querySelectorAll("*:not(a *):not(button *)"),
  ).map((element) => {
    const text = element.textContent.trim().replace(/\s{2,}/g, " ");
    const tag = element.tagName.toLowerCase();
    const ariaLabel = element.getAttribute("aria-label") || "";

    const rects = getElementRects(element);

    const area = rects.reduce((acc, r) => acc + r.width * r.height, 0);
    const style = window.getComputedStyle(element);
    const include =
      tag === "input" ||
      tag === "textarea" ||
      tag === "select" ||
      tag === "button" ||
      tag === "a" ||
      element.onclick != null ||
      style.cursor === "pointer" ||
      tag === "iframe" ||
      tag === "video";

    // 纯文字元素：有文本、没有子元素、且不是 script/style
    const isText =
      !include &&
      typeof text === "string" &&
      text.length > 0 &&
      element.children.length === 0 &&
      tag !== "script" &&
      tag !== "style";

    return { element, include, isText, rects, area, tag, text, ariaLabel };
  });

  // 过滤掉非交互或面积过小的元素
  // 保留交互元素或纯文字元素
  items = items.filter(
    (item) => (item.include || item.isText) && item.area >= 20,
  );

  // 删除父元素，保留子元素（避免重复框）
  items = items.filter(
    (x) => !items.some((y) => x.element.contains(y.element) && x !== y),
  );

  return items;
}

// --- 计算 IoU ---
function getBoundingBox(rects) {
  if (!rects.length) return null;
  let left = rects[0].left;
  let top = rects[0].top;
  let right = rects[0].right;
  let bottom = rects[0].bottom;
  for (let i = 1; i < rects.length; i++) {
    left = Math.min(left, rects[i].left);
    top = Math.min(top, rects[i].top);
    right = Math.max(right, rects[i].right);
    bottom = Math.max(bottom, rects[i].bottom);
  }
  return {
    left,
    top,
    right,
    bottom,
    width: right - left,
    height: bottom - top,
  };
}

function getIoU(item1, item2) {
  const box1 = getBoundingBox(item1.rects);
  const box2 = getBoundingBox(item2.rects);
  if (!box1 || !box2) return 0;

  const x_left = Math.max(box1.left, box2.left);
  const y_top = Math.max(box1.top, box2.top);
  const x_right = Math.min(box1.right, box2.right);
  const y_bottom = Math.min(box1.bottom, box2.bottom);

  if (x_right < x_left || y_bottom < y_top) return 0;

  const intersectionArea = (x_right - x_left) * (y_bottom - y_top);
  const area1 = box1.width * box1.height;
  const area2 = box2.width * box2.height;
  const unionArea = area1 + area2 - intersectionArea;

  return intersectionArea / unionArea;
}

// --- 主入口函数 ---
async function markPage() {
  let items = getInteractiveElements();

  // 获取组件 Schema 信息
  let schema = [];
  if (window.__ci4a__ && typeof window.__ci4a__.exportSchema === "function") {
    try {
      schema = await window.__ci4a__.exportSchema();
    } catch (e) {
      console.error("Failed to export schema", e);
    }
  }

  // --- 处理带有 data-api-id 的组件 ---
  const apiElements = Array.from(document.querySelectorAll("[data-cid]"));

  for (const el of apiElements) {
    const apiId = el.getAttribute("data-cid");

    // 检查是否已在 items 中
    let item = items.find((x) => x.element === el);

    if (!item) {
      // 检查当前元素是否在视口内可见
      const bb = el.getBoundingClientRect();
      const vw = Math.max(
        document.documentElement.clientWidth || 0,
        window.innerWidth || 0,
      );
      const vh = Math.max(
        document.documentElement.clientHeight || 0,
        window.innerHeight || 0,
      );

      // 判断与视口是否有交集
      const isVisible =
        bb.width > 0 &&
        bb.height > 0 &&
        bb.bottom > 0 &&
        bb.right > 0 &&
        bb.top < vh &&
        bb.left < vw;

      if (!isVisible) continue;

      // 计算在视口内的可视区域
      const rect = {
        left: Math.max(0, bb.left),
        top: Math.max(0, bb.top),
        right: Math.min(vw, bb.right),
        bottom: Math.min(vh, bb.bottom),
      };

      const finalRects = [
        {
          ...rect,
          width: rect.right - rect.left,
          height: rect.bottom - rect.top,
        },
      ];
      const area = finalRects.reduce((acc, r) => acc + r.width * r.height, 0);

      // 获取基本信息
      const text = el.textContent.trim().replace(/\s{2,}/g, " ");
      const tag = el.tagName.toLowerCase();
      const ariaLabel = el.getAttribute("aria-label") || "";

      item = {
        element: el,
        include: true,
        rects: finalRects,
        area,
        tag,
        text,
        ariaLabel,
      };
      items.push(item);
    }

    // 标记为组件
    item.isComponent = true;

    // 获取 API 信息
    const type = apiId.split("_")[0];
    item.componentType = apiId;

    // 获取 Actions 信息 (优先使用 Schema)
    let actions = [];
    const compSchema = schema.find((s) => s.componentId === apiId);
    if (compSchema && compSchema.actions) {
      actions = compSchema.actions;
    }
    // 查找符合 get...Status 格式的函数
    const statusActionObj = actions.find((action) =>
      /^get.*Status$/.test(action.name),
    );
    const statusActionName = statusActionObj ? statusActionObj.name : null;

    // 构建 apiActions 字符串，包含参数信息
    const displayActions = actions
      .filter((a) => a.name !== statusActionName)
      .map((a) => {
        if (a.params && a.params.length) {
          const paramList = a.params.map((p) => {
            if (typeof p === "object" && p.name) {
              return p.type ? `${p.name}: ${p.type}` : p.name;
            }
            return p;
          });
          return `${a.name}(${paramList.join(", ")})`;
        }
        return a.name;
      });

    item.apiActions = displayActions.join(" ");

    if (window.__ci4a__ && statusActionName) {
      try {
        const res = await window.__ci4a__.call(apiId, statusActionName);
        if (res && res.data !== undefined) {
          const resData = res.data;
          const resStr =
            typeof resData === "string" ? resData : JSON.stringify(resData);
          item.text = `${resStr}`;
        }
      } catch (e) {
        console.error(`Failed to call agent api for ${apiId}`, e);
      }
    }
  }

  // --- 去重：保留组件框 ---
  items = items.filter((item) => {
    if (item.isComponent) return true;
    // 如果普通元素与某个组件元素重叠严重 (IoU > 0.5)，则移除
    const overlap = items.some(
      (comp) => comp.isComponent && getIoU(item, comp) > 0.5,
    );
    return !overlap;
  });

  // --- 构建组件父子关系 ---
  // 为每个组件 item 添加 componentChildren 和 componentParent 字段，保留嵌套关系
  const componentItems = items.filter((it) => it.isComponent);

  // 构建一个包含所有在 items 中的 data-cid 的集合，后续用于过滤
  const componentIdSet = new Set(
    componentItems
      .map((ci) =>
        ci.element && ci.element.getAttribute
          ? ci.element.getAttribute("data-cid")
          : null,
      )
      .filter(Boolean),
  );

  for (const it of componentItems) {
    // 所有在该组件元素内部的子组件（包含多级嵌套）
    const childEls = Array.from(
      it.element.querySelectorAll("[data-cid]"),
    ).filter((el) => el !== it.element);

    // 只保留那些也存在于 items（componentItems）中的子组件 id
    const childIds = Array.from(
      new Set(
        childEls
          .map((el) => (el.getAttribute ? el.getAttribute("data-cid") : null))
          .filter(Boolean),
      ),
    ).filter((id) => componentIdSet.has(id));

    it.componentChildren = childIds;

    // 寻找最近的父组件（最近的祖先元素中第一个带 data-cid 的），并且该父组件必须在 items 中
    let parentId = null;
    if (it.element.closest) {
      const parentEl = it.element.closest("[data-cid]");
      if (parentEl && parentEl !== it.element) {
        const pid = parentEl.getAttribute("data-cid");
        if (pid && componentIdSet.has(pid)) parentId = pid;
      }
    }
    it.componentParent = parentId;
  }

  // 返回元素中心坐标（用于进一步逻辑）
  return items.flatMap((item) =>
    item.rects.map(({ left, top, width, height }) => ({
      left: left,
      top: top,
      right: left + width,
      bottom: top + height,
      x: left + width / 2,
      y: top + height / 2,
      type: item.isComponent ? item.componentType : item.tag,
      text: item.text,
      ariaLabel: item.ariaLabel,
      isComponent: item.isComponent || false,
      apiActions: item.apiActions || "",
      componentChildren: item.componentChildren || [],
      componentParent: item.componentParent || null,
    })),
  );
}
