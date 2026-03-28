// wechat.js - 极致 X 交互 + 独立详情页 + 沉浸式评论 + 优化版Ins风极简聊天室

function renderWechat() {
  const appLayer = document.getElementById('app-layer');
  if (!appLayer) return;

  appLayer.innerHTML = `
  <style>
    :root {
      --bg: #FFFFFF; --sub-bg: #F7F9F9; --text: #0F1419; --muted: #536471;
      --accent: #1D9BF0; --sep: #EFF3F4; --glass: rgba(255,255,255,0.85);
      --heart: #F91880; --rt: #00BA7C;
    }
    .wc * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; -webkit-tap-highlight-color: transparent; }
    .wc { width: 100vw; height: 100vh; background: var(--bg); position: relative; overflow: hidden; color: var(--text); display: flex; flex-direction: column; }
    
    /* --- 1. 顶部栏 (拉长高度) --- */
    .header { height: calc(56px + env(safe-area-inset-top, 20px)); padding-top: env(safe-area-inset-top, 20px); display: flex; align-items: center; justify-content: space-between; padding-left: 16px; padding-right: 16px; background: var(--glass); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); position: sticky; top: 0; z-index: 1000; border-bottom: 1px solid var(--sep); }
    .header .left-title { font-size: 22px; font-weight: 800; cursor: pointer; color: var(--text); letter-spacing: -0.5px; width: 80px; display: flex; align-items: center; gap: 4px;}
    .header .center-title { font-size: 18px; font-weight: 800; position: absolute; left: 50%; transform: translateX(-50%); }
    .header .icon-btn { cursor: pointer; color: var(--text); display: flex; align-items: center; justify-content: flex-end; width: 60px; }

    /* --- 2. 视图容器 --- */
    .view { flex: 1; overflow-y: auto; display: none; padding-bottom: 120px; background: var(--bg); position: relative;}
    .view.on { display: block; animation: wcFade 0.2s ease; }
    @keyframes wcFade { from { opacity: 0; } to { opacity: 1; } }
    .view::-webkit-scrollbar { display: none; }

    /* --- 3. 聊天列表 --- */
    .item-row { display: flex; align-items: center; padding: 12px 16px; cursor: pointer; transition: background 0.2s; border-bottom: 1px solid var(--sep); }
    .item-row:active { background: rgba(0,0,0,0.02); }
    .av-icon { width: 50px; height: 50px; border-radius: 50%; background: #eee; flex-shrink: 0; object-fit: cover; }
    .item-info { flex: 1; margin-left: 12px; min-width: 0; }
    .item-name { font-size: 16px; font-weight: 700; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .item-msg { font-size: 14px; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px; }

    /* --- 4. 仿 X 真实动态流 (Feed & Detail) --- */
    .x-post { padding: 16px; border-bottom: 1px solid var(--sep); display: flex; gap: 12px; cursor: pointer; transition: 0.2s; background: #fff; -webkit-user-select: none;}
    .x-post:active { background: rgba(0,0,0,0.02); }
    .x-av { width: 44px; height: 44px; border-radius: 50%; background: #eee; flex-shrink: 0; object-fit: cover; }
    .x-main { flex: 1; min-width: 0; pointer-events: none; }
    .x-user-info { display: flex; gap: 6px; align-items: baseline; margin-bottom: 4px; pointer-events: auto;}
    .x-name { font-weight: 800; font-size: 15px; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .x-time { color: var(--muted); font-size: 14px; }
    .x-content { font-size: 15px; line-height: 1.45; margin-bottom: 10px; color: var(--text); white-space: pre-wrap; word-wrap: break-word; pointer-events: auto;}
    
    .x-img-grid { display: grid; gap: 4px; border-radius: 16px; overflow: hidden; border: 1px solid var(--sep); margin-bottom: 12px; pointer-events: auto;}
    .x-img-grid img { width: 100%; height: 100%; object-fit: cover; display: block; }

    .x-actions { display: flex; justify-content: space-between; max-width: 85%; color: var(--muted); pointer-events: auto; margin-top: 4px;}
    .x-act-item { display: flex; align-items: center; gap: 4px; font-size: 13px; transition: 0.1s; cursor: pointer;}
    .x-act-item svg { width: 18px; height: 18px; stroke-width: 1.5; }
    .act-cmt:active { color: var(--accent); } .act-rt:active { color: var(--rt); }
    .act-like.liked { color: var(--heart); }
    .act-like.liked svg { fill: var(--heart); stroke: var(--heart); animation: heartPop 0.3s cubic-bezier(0.17, 0.89, 0.32, 1.49); }
    @keyframes heartPop { 0% { transform: scale(1); } 50% { transform: scale(1.3); } 100% { transform: scale(1); } }
    .act-fav.fav { color: var(--accent); } .act-fav.fav svg { fill: var(--accent); stroke: var(--accent); }

    .pd-comments { padding-bottom: 80px; }
    .pd-reply-item { display: flex; gap: 12px; padding: 16px; border-bottom: 1px solid var(--sep); cursor: pointer; transition: 0.2s; }
    .pd-reply-item:active { background: rgba(0,0,0,0.02); }
    .pd-reply-av { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; background: #eee; }
    .pd-reply-main { flex: 1; }
    .pd-reply-name { font-size: 14px; font-weight: 800; margin-bottom: 2px; }
    .pd-reply-text { font-size: 14px; line-height: 1.4; color: var(--text); }
    
    .pd-bottom-bar { position: fixed; bottom: 0; left: 0; right: 0; background: var(--bg); border-top: 1px solid var(--sep); padding: 10px 16px; padding-bottom: calc(10px + env(safe-area-inset-bottom, 15px)); display: flex; gap: 10px; align-items: center; z-index: 100; }
    .pd-inp { flex: 1; min-width: 0; background: var(--sub-bg); border: none; border-radius: 20px; padding: 10px 16px; font-size: 15px; outline: none; }
    .pd-btn { flex-shrink: 0; white-space: nowrap; background: var(--accent); color: #fff; border: none; border-radius: 16px; padding: 8px 16px; font-weight: 700; cursor: pointer; display: none; }

    /* --- 5. 个人中心 --- */
    .me-profile { display: flex; flex-direction: column; align-items: center; padding: 30px 0; }
    .me-av-big { width: 90px; height: 90px; border-radius: 50%; object-fit: cover; margin-bottom: 12px; border: 1px solid var(--sep); cursor: pointer;}
    .me-name { font-size: 24px; font-weight: 900; letter-spacing: -0.5px; cursor: pointer; padding: 0 10px;}
    .me-id { font-size: 14px; color: var(--muted); margin-top: 4px; cursor: pointer; padding: 0 10px;}
    .me-menu { margin: 0 16px; background: var(--sub-bg); border-radius: 16px; overflow: hidden; }
    .me-item { padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #FFF; cursor: pointer; }
    .me-item span { font-weight: 700; font-size: 16px; }

    /* --- 6. 发布动态页 --- */
    .compose-view { position: fixed; inset: 0; background: var(--bg); z-index: 4000; transform: translateY(100%); transition: 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); display: flex; flex-direction: column; }
    .compose-view.on { transform: translateY(0); }
    .cp-bar { height: calc(46px + env(safe-area-inset-top, 20px)); padding-top: env(safe-area-inset-top, 20px); display: flex; align-items: center; justify-content: space-between; padding-left: 16px; padding-right: 16px; border-bottom: 1px solid var(--sep); flex-shrink: 0;}
    .cp-cancel { font-size: 16px; color: var(--text); cursor: pointer; }
    .cp-send { font-size: 15px; font-weight: 700; background: var(--accent); color: #fff; padding: 6px 16px; border-radius: 999px; cursor: pointer; }
    .cp-body { padding: 16px; display: flex; gap: 12px; flex: 1; overflow-y: auto; }
    .cp-input-wrap { flex: 1; display: flex; flex-direction: column; min-height: 100%; }
    .cp-input { width: 100%; min-height: 100px; border: none; outline: none; font-size: 18px; resize: none; background: transparent; color: var(--text); }
    .cp-input::placeholder { color: var(--muted); }
    .cp-img-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px; padding-bottom: 20px;}
    .cp-img-item { position: relative; padding-top: 100%; border-radius: 12px; overflow: hidden; border: 1px solid var(--sep); background: #eee;}
    .cp-img-item img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
    .cp-img-del { position: absolute; top: 6px; right: 6px; width: 24px; height: 24px; border-radius: 50%; background: rgba(0,0,0,0.6); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 16px; cursor: pointer; z-index: 10;}
    .cp-tools { padding: 12px 16px; border-top: 1px solid var(--sep); display: flex; gap: 20px; color: var(--accent); flex-shrink: 0; padding-bottom: env(safe-area-inset-bottom, 15px);}

    /* --- 7. 悬浮底栏 --- */
    .tab-dock-wrap { position: absolute; bottom: 30px; left: 0; right: 0; display: flex; justify-content: center; z-index: 2000; pointer-events: none; }
    .tab-dock { pointer-events: auto; display: flex; gap: 20px; padding: 10px 25px; background: rgba(255,255,255,0.75); backdrop-filter: blur(25px) saturate(180%); -webkit-backdrop-filter: blur(25px) saturate(180%); border-radius: 35px; border: 1px solid rgba(255,255,255,0.4); box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
    .t-item { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; color: #999; transition: 0.2s; cursor: pointer; }
    .t-item.on { color: var(--text); transform: translateY(-2px); }
    .t-item svg { width: 26px; height: 26px; stroke-width: 2; }

    /* --- 8. 极简聊天室 --- */
    #v-chat-room { background: #F3F3F3; }
    
    .chat-container { 
        padding: 16px; padding-bottom: 120px; 
        display: flex; flex-direction: column; min-height: 100%; 
    }
    
    /* 中点对齐 align-items: center */
    .msg-row { display: flex; width: 100%; align-items: center; gap: 10px; margin: 6px 0; }
    .msg-row.me { justify-content: flex-end; }
    .msg-row.them { justify-content: flex-start; }
    
    /* 方头像，圆角35，尺寸扩大到 38px (比拉高后的单行气泡依然稍大 1px) */
    .msg-av { width: 38px; height: 38px; border-radius: 35px; object-fit: cover; flex-shrink: 0; background: #eee;}
    
    /* 矩形气泡，圆角改为8，上下宽度改为 6px */
    .chat-bubble { 
        max-width: 68%; padding: 6px 14px; font-size: 15px; 
        line-height: 1.4; word-wrap: break-word; border-radius: 35px; 
    }
    /* char气泡: 白色 */
    .chat-bubble.them { background: #FFFFFF; color: var(--text); }
    /* user气泡: #828A93 */
    .chat-bubble.me { background: #828A93; color: #FFFFFF; }

    /* Ins风极简底栏 (拉高拉宽) */
    .chat-bottom-bar {
      position: fixed; bottom: 0; left: 0; right: 0; z-index: 100;
      padding: 12px 14px; padding-bottom: calc(12px + env(safe-area-inset-bottom, 15px));
      background: #FFFFFF; border-top: 1px solid #EFEFEF;
      display: flex; gap: 10px; align-items: center;
    }
    .cbb-add { width: 32px; height: 32px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: var(--text); cursor: pointer; }
    
    /* 胶囊状无边框输入框 */
    .cbb-inp { flex: 1; min-width: 0; background: #F2F2F2; border: none; border-radius: 20px; padding: 10px 16px; font-size: 15px; outline: none; color: var(--text); }
    
    /* Ins风纯图标圆形按钮 */
    .cbb-btn-circle { 
        width: 36px; height: 36px; border-radius: 50%; 
        display: flex; align-items: center; justify-content: center; 
        cursor: pointer; flex-shrink: 0; 
        border: none; outline: none;
        transition: transform 0.1s;
    }
    /* 接收键：浅灰底，深灰AI四角星图标 */
    .cbb-btn-circle.receive { background: #EFEFEF; color: #262626; }
    /* 发送键：灰底，白色纸飞机图标 */
    .cbb-btn-circle.send { background: #828A93; color: #FFFFFF; }
    .cbb-btn-circle:active { transform: scale(0.9); }
    .cbb-btn-circle svg { width: 18px; height: 18px; }

    /* --- 通用弹窗 UI --- */
    .pop-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); z-index: 5000; display: none; align-items: center; justify-content: center; animation: popFade 0.2s ease; }
    @keyframes popFade { from { opacity: 0; } to { opacity: 1; } }
    .pop-card { width: 85%; max-width: 320px; background: #FFF; border-radius: 20px; padding: 20px; text-align: center; transform: scale(0.9); animation: popScale 0.2s cubic-bezier(0.17, 0.89, 0.32, 1.28) forwards; box-shadow: 0 20px 40px rgba(0,0,0,0.2);}
    @keyframes popScale { to { transform: scale(1); } }
    .pop-title { font-size: 18px; font-weight: 800; margin-bottom: 15px; }
    .pop-input { width: 100%; padding: 12px; background: var(--sub-bg); border: 1px solid var(--sep); border-radius: 12px; font-size: 15px; margin-bottom: 20px; outline: none; }
    .pop-list { max-height: 250px; overflow-y: auto; text-align: left; margin-bottom: 15px; }
    .pop-list-item { padding: 12px 10px; border-bottom: 1px solid var(--sep); display: flex; gap: 10px; align-items: center; cursor: pointer; }
    .pop-btns { display: flex; gap: 10px; flex-direction: column;}
    .pop-btn-row { display: flex; gap: 10px; width: 100%;}
    .pop-btn { flex: 1; padding: 12px; border-radius: 12px; font-weight: 700; cursor: pointer; }
    .btn-cancel { background: var(--sub-bg); color: var(--text); }
    .btn-confirm { background: var(--text); color: #FFF; }
    .btn-danger { background: #FFEBEB; color: #F91880; margin-bottom: 5px;}

    .toast { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.85); color: #fff; padding: 12px 24px; border-radius: 16px; font-size: 14px; font-weight: 600; opacity: 0; pointer-events: none; transition: 0.3s; z-index: 9999; text-align: center; }
    .toast.on { opacity: 1; }
  </style>

  <div class="wc">
    <!-- 动态可控的顶部栏 -->
    <div class="header" id="wc-header">
      <div class="left-title" id="header-left" onclick="closeApp()">Chat</div>
      <div class="center-title" id="header-center"></div>
      <div class="icon-btn" id="header-right"></div>
    </div>

    <!-- 列表 -->
    <div id="v-chats" class="view on"><div id="chat-list-box"></div></div>
    <div id="v-explore" class="view"><div id="x-stream"></div></div>
    <div id="v-favs" class="view"><div id="fav-stream"></div></div>

    <!-- 极简聊天室 -->
    <div id="v-chat-room" class="view" style="padding-bottom:0;">
      <div id="chat-msgs-box" class="chat-container"></div>
      <div class="chat-bottom-bar" id="chat-bottom-bar">
        <div class="cbb-add" onclick="wc_showToast('Menus')">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 5v14M5 12h14"/></svg>
        </div>
        <input type="text" id="cg-inp-val" class="cbb-inp" placeholder="Message..." onkeypress="if(event.key === 'Enter') wc_sendChatMsg()">
        <!-- 圆形图标 接收键 -->
        <button class="cbb-btn-circle receive" onclick="wc_forceReply()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/></svg>
        </button>
        <!-- 圆形图标 发送键 -->
        <button class="cbb-btn-circle send" onclick="wc_sendChatMsg()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </button>
      </div>
    </div>

    <!-- Post 详情页 -->
    <div id="v-post-detail" class="view" style="padding-bottom:0; background:var(--bg);">
      <div id="pd-main-post"></div>
      <div id="pd-comments-box" class="pd-comments"></div>
      <div class="pd-bottom-bar" id="pd-bottom-bar">
        <input type="text" id="pd-inp-val" class="pd-inp" placeholder="Post your reply..." oninput="wc_checkReplyInp()">
        <button id="pd-btn-reply" class="pd-btn" onclick="wc_submitReply()">Reply</button>
      </div>
    </div>

    <!-- 设置 Me -->
    <div id="v-me" class="view">
      <div class="me-profile">
        <div style="position:relative; display:inline-block; cursor:pointer;" onclick="wc_editMe('avatar')">
          <img id="me-avatar" src="" class="me-av-big" style="margin-bottom:0;">
          <div style="position:absolute; bottom:0; right:0; background:var(--accent); border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; border:2px solid var(--bg);">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          </div>
        </div>
        <div class="me-name" id="me-nickname" onclick="wc_editMe('name')" style="margin-top:12px;">User</div>
        <div class="me-id" id="me-id" onclick="wc_editMe('handle')">@id</div>
      </div>
      <div class="me-menu">
        <div class="me-item" onclick="wc_switch('favs', null)"><span>My Favorites</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg></div>
        <div class="me-item" onclick="wc_showToast('Wallet coming soon~')"><span>Wallet</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg></div>
      </div>
    </div>

    <!-- 底栏 -->
    <div class="tab-dock-wrap" id="wc-dock">
      <div class="tab-dock">
        <div class="t-item on" id="tab-chats" onclick="wc_switch('chats', this)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>
        <div class="t-item" id="tab-explore" onclick="wc_switch('explore', this)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><path d="M16.2 7.8l-2 6.4-6.4 2 2-6.4 6.4-2z"/></svg></div>
        <div class="t-item" id="tab-me" onclick="wc_switch('me', this)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/></svg></div>
      </div>
    </div>

    <!-- 发布动态页 Compose -->
    <div class="compose-view" id="v-compose">
      <div class="cp-bar">
        <div class="cp-cancel" onclick="wc_closeCompose()">Cancel</div>
        <div class="cp-send" onclick="wc_submitPost()">Post</div>
      </div>
      <div class="cp-body">
        <img id="cp-my-av" src="" style="width:40px;height:40px;border-radius:50%;object-fit:cover;flex-shrink:0;">
        <div class="cp-input-wrap">
          <textarea class="cp-input" id="cp-text" placeholder="What's happening?"></textarea>
          <div class="cp-img-grid" id="cp-img-grid"></div>
        </div>
      </div>
      <div class="cp-tools">
        <div style="cursor:pointer; position:relative;">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          <input type="file" accept="image/*" style="position:absolute;inset:0;opacity:0;cursor:pointer;" onchange="wc_handlePostImg(this)">
        </div>
      </div>
    </div>

    <!-- 通用弹窗 -->
    <div class="pop-overlay" id="pop-box">
      <div class="pop-card">
        <div class="pop-title" id="pop-title">Title</div>
        <div id="pop-content"></div>
        <div class="pop-btns" id="pop-btns"></div>
      </div>
    </div>

    <div class="toast" id="wc-toast"></div>
  </div>
  `;

  wc_initAll();
}

// ================= 全局数据与初始化 =================

window.wc_my_info = { name: "User", handle: "zero_user", avatar: "https://image.uglycat.cc/at03ir.png" };
window.wc_temp_post_imgs = []; 
window.wc_current_post_id = null; // 当前正在查看详情的 Post ID
window.wc_prev_view = 'explore'; // 记录从哪进的详情页
window.wc_current_chat_id = null; // 当前聊天对象
window.wc_current_chat_name = "";
window.wc_current_chat_av = "";

const iconAdd = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 5v14M5 12h14"/></svg>`;

window.wc_initAll = function() {
  const meStr = localStorage.getItem('wc_user_me');
  if (meStr) window.wc_my_info = JSON.parse(meStr);
  wc_refreshMeUI();

  const moments = localStorage.getItem('wc_moments');
  if (!moments) {
    const initData = [{
      id: 'm_init_1', authorId: 'system', authorName: 'Zero System', authorHandle: 'zero', avatar: 'https://image.uglycat.cc/crabxl.png',
      content: 'Welcome to your timeline. Click me to see details and reply! ✨', images: [], time: 'Just now',
      likes: 0, isLiked: false, comments: [], isBookmarked: false
    }];
    localStorage.setItem('wc_moments', JSON.stringify(initData));
  }
  wc_switch('chats', document.getElementById('tab-chats'));
};

window.wc_refreshMeUI = function() {
  document.getElementById('me-avatar').src = window.wc_my_info.avatar;
  document.getElementById('me-nickname').innerText = window.wc_my_info.name;
  document.getElementById('me-id').innerText = "@" + window.wc_my_info.handle;
  document.getElementById('cp-my-av').src = window.wc_my_info.avatar;
};

window.wc_showToast = function(msg) {
  const t = document.getElementById('wc-toast');
  t.innerText = msg; t.classList.add('on');
  setTimeout(() => t.classList.remove('on'), 2000);
};

// ================= 视图切换 =================
window.wc_switch = function(id, el) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('on'));
  document.querySelectorAll('.t-item').forEach(t => t.classList.remove('on'));
  
  document.getElementById('v-' + id).classList.add('on');
  if (el) el.classList.add('on');

  const header = document.getElementById('wc-header');
  const left = document.getElementById('header-left');
  const center = document.getElementById('header-center');
  const right = document.getElementById('header-right');
  const dock = document.getElementById('wc-dock');

  if(id === 'me') {
    header.style.display = 'none'; dock.style.display = 'flex';
  } else if (id === 'post-detail') {
    header.style.display = 'flex'; dock.style.display = 'none'; 
    left.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg> Post`;
    left.onclick = () => wc_switch(window.wc_prev_view, document.getElementById('tab-' + window.wc_prev_view));
    center.innerText = 'Post'; right.innerHTML = '';
  } else if (id === 'chat-room') {
    header.style.display = 'flex'; dock.style.display = 'none'; 
    // 左边：返回键
    left.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg>`;
    left.onclick = () => wc_switch('chats', document.getElementById('tab-chats'));
    // 居中：名字
    center.innerText = window.wc_current_chat_name; 
    // 最右边：设置键 (横着的三个点)
    right.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm8 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm8 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/></svg>`;
    right.onclick = () => wc_showToast('Settings');
  } else if (id === 'favs') {
    header.style.display = 'flex'; dock.style.display = 'none'; 
    left.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg>`;
    left.onclick = () => wc_switch('me', document.getElementById('tab-me'));
    center.innerText = 'Favorites'; right.innerHTML = '';
    wc_renderFavs();
  } else {
    header.style.display = 'flex'; dock.style.display = 'flex';
    if(id === 'chats') {
      left.innerText = 'Chat'; left.onclick = () => closeApp();
      center.innerText = '';
      right.innerHTML = iconAdd; right.onclick = () => wc_showToast('New Chat (Coming Soon)');
      wc_renderChats();
    } else if(id === 'explore') {
      left.innerText = ''; left.onclick = null;
      center.innerText = 'Explore';
      right.innerHTML = iconAdd; right.onclick = () => wc_openCompose();
      wc_renderMoments();
    }
  }
};

// ================= 聊天列表 & 聊天室 =================
window.wc_renderChats = function() {
  const allChars = JSON.parse(localStorage.getItem('ai_chars_safe') || '[]');
  const mainChars = allChars.filter(c => c.role === 'main');
  const box = document.getElementById('chat-list-box');
  if(mainChars.length === 0) { box.innerHTML = `<div style="padding:60px; text-align:center; color:var(--muted); font-size:15px;">No souls here.</div>`; return; }
  
  box.innerHTML = mainChars.map(char => {
    const cId = char.id || char.name; // fallback if id is missing
    const safeName = char.name.replace(/'/g, "\\'");
    return `<div class="item-row" onclick="wc_openChat('${cId}', '${safeName}', '${char.avatar || ''}')"><img src="${char.avatar || ''}" class="av-icon" onerror="this.src='';this.style.background='#EEE'"><div class="item-info"><div class="item-name">${char.name}</div><div class="item-msg">${char.signature || 'Tap to chat ✨'}</div></div></div>`;
  }).join('');
};

window.wc_openChat = function(id, name, avatar) {
  window.wc_current_chat_id = id;
  window.wc_current_chat_name = name;
  window.wc_current_chat_av = avatar;
  
  // Initialize chat history if empty
  let history = JSON.parse(localStorage.getItem('wc_chat_' + id) || '[]');
  if(history.length === 0) {
      history.push({ role: 'them', text: `Hi there! I'm ${name}. ✨` });
      localStorage.setItem('wc_chat_' + id, JSON.stringify(history));
  }
  
  wc_switch('chat-room');
  wc_renderChatMsgs();
};

window.wc_renderChatMsgs = function() {
  const history = JSON.parse(localStorage.getItem('wc_chat_' + window.wc_current_chat_id) || '[]');
  const box = document.getElementById('chat-msgs-box');
  const myAv = window.wc_my_info.avatar;
  const themAv = window.wc_current_chat_av;

  box.innerHTML = history.map(m => {
      if(m.role === 'me') {
          return `<div class="msg-row me"><div class="chat-bubble me">${m.text}</div><img src="${myAv}" class="msg-av" onerror="this.src='';this.style.background='#EEE'"></div>`;
      } else {
          return `<div class="msg-row them"><img src="${themAv}" class="msg-av" onerror="this.src='';this.style.background='#EEE'"><div class="chat-bubble them">${m.text}</div></div>`;
      }
  }).join('');
  
  // scroll to bottom
  const view = document.getElementById('v-chat-room');
  setTimeout(() => view.scrollTop = view.scrollHeight, 50);
};

window.wc_sendChatMsg = function() {
  const inp = document.getElementById('cg-inp-val');
  const text = inp.value.trim();
  if(!text) return;
  
  let history = JSON.parse(localStorage.getItem('wc_chat_' + window.wc_current_chat_id) || '[]');
  history.push({ role: 'me', text: text });
  localStorage.setItem('wc_chat_' + window.wc_current_chat_id, JSON.stringify(history));
  inp.value = '';
  wc_renderChatMsgs();
};

// 独立的接收按键触发回复
window.wc_forceReply = function() {
  wc_showToast('Calling API...');
  setTimeout(() => {
      let h = JSON.parse(localStorage.getItem('wc_chat_' + window.wc_current_chat_id) || '[]');
      const replies = ["Wow, that's interesting! 😮", "I totally agree! ✨", "Tell me more about it~", "Haha so true 😂"];
      h.push({ role: 'them', text: replies[Math.floor(Math.random() * replies.length)] });
      localStorage.setItem('wc_chat_' + window.wc_current_chat_id, JSON.stringify(h));
      if(document.getElementById('v-chat-room').classList.contains('on')) wc_renderChatMsgs();
  }, 600);
};

// ================= 个人资料修改 =================
window.wc_temp_me_av = null;
window.wc_editMe = function(type) {
  let title = '', placeholder = '';
  if(type === 'name') { title = "Edit Nickname"; placeholder = "Your nickname"; }
  if(type === 'handle') { title = "Edit WeChat ID"; placeholder = "Your unique ID"; }
  if(type === 'avatar') { title = "Edit Avatar"; window.wc_temp_me_av = null; }

  document.getElementById('pop-title').innerText = title;
  
  let contentHtml = '';
  if (type === 'avatar') {
    contentHtml = `
      <div style="display:flex; flex-direction:column; gap:15px; margin-bottom:20px;">
        <div style="position:relative; background: var(--sub-bg); border-radius:12px; padding:15px; color:var(--accent); font-weight:700; cursor:pointer; text-align:center; border: 1px dashed var(--accent);">
          + Select from Album
          <input type="file" accept="image/*" style="position:absolute; inset:0; width:100%; height:100%; opacity:0; cursor:pointer;" onchange="wc_handleLocalMeAv(this)">
        </div>
        <div style="color:var(--muted); font-size:13px; font-weight:bold;">OR PASTE URL</div>
        <input type="text" id="pop-inp-val" class="pop-input" placeholder="https://..." style="margin-bottom:0;" value="">
      </div>
    `;
  } else {
    contentHtml = `<input type="text" id="pop-inp-val" class="pop-input" placeholder="${placeholder}" value="${window.wc_my_info[type] || ''}">`;
  }
  
  document.getElementById('pop-content').innerHTML = contentHtml;
  document.getElementById('pop-btns').innerHTML = `<div class="pop-btn-row"><div class="pop-btn btn-cancel" onclick="wc_closePop()">Cancel</div><div class="pop-btn btn-confirm" id="pop-confirm">Save</div></div>`;
  
  document.getElementById('pop-confirm').onclick = () => {
    const val = document.getElementById('pop-inp-val').value.trim();
    if(type === 'avatar') {
      if(window.wc_temp_me_av && val === "(Local Image Selected)") window.wc_my_info.avatar = window.wc_temp_me_av;
      else if (val) window.wc_my_info.avatar = val;
    } else { if(val) window.wc_my_info[type] = val; }
    
    try {
        localStorage.setItem('wc_user_me', JSON.stringify(window.wc_my_info));
        wc_refreshMeUI(); 
        wc_closePop();
    } catch (e) {
        wc_showToast("Save failed, image might be too large!");
    }
  };
  document.getElementById('pop-box').style.display = 'flex';
};

window.wc_handleLocalMeAv = function(input) {
  const file = input.files[0]; if(!file) return;
  const reader = new FileReader(); 
  reader.onload = e => { 
    const img = new Image(); img.src = e.target.result;
    img.onload = () => {
        const cvs = document.createElement('canvas'); const ctx = cvs.getContext('2d');
        const maxW = 300; let w = img.width, h = img.height;
        if(w > maxW) { h *= maxW/w; w = maxW; } 
        cvs.width = w; cvs.height = h; ctx.drawImage(img, 0,0, w, h);
        window.wc_temp_me_av = cvs.toDataURL('image/jpeg', 0.85); 
        document.getElementById('pop-inp-val').value = "(Local Image Selected)"; 
    };
  };
  reader.readAsDataURL(file);
  input.value = ""; 
};
window.wc_closePop = function() { document.getElementById('pop-box').style.display = 'none'; };

// ================= 动态 (Explore) 防误触 & 列表渲染 =================
window.wc_getMoments = () => JSON.parse(localStorage.getItem('wc_moments') || '[]');
window.wc_saveMoments = (data) => localStorage.setItem('wc_moments', JSON.stringify(data));

window.wc_lpTimer = null;
window.wc_lpFired = false;

window.wc_lpDown = function(e, id) {
  window.wc_lpFired = false;
  window.wc_lpTimer = setTimeout(() => {
    window.wc_lpFired = true;
    window.wc_current_action_id = id;
    document.getElementById('pop-title').innerText = "Post Actions";
    document.getElementById('pop-content').innerHTML = ``;
    document.getElementById('pop-btns').innerHTML = `
      <div class="pop-btn btn-cancel" style="margin-bottom:10px;" onclick="wc_editPost()">Edit Post</div>
      <div class="pop-btn btn-danger" style="margin-bottom:10px;" onclick="wc_deletePost()">Delete Post</div>
      <div class="pop-btn btn-cancel" onclick="wc_closePop()">Cancel</div>
    `;
    document.getElementById('pop-box').style.display = 'flex';
  }, 600);
};
window.wc_lpUp = function() { if(window.wc_lpTimer) clearTimeout(window.wc_lpTimer); };

window.wc_postClick = function(e, id) {
  if(window.wc_lpFired) return;
  const currentViewId = document.querySelector('.view.on').id.replace('v-', '');
  if (currentViewId !== 'post-detail') {
    window.wc_prev_view = currentViewId;
  }
  window.wc_current_post_id = id;
  wc_switch('post-detail');
  wc_renderPostDetail();
};

window.wc_deletePost = function() {
    let data = wc_getMoments().filter(p => p.id !== window.wc_current_action_id);
    wc_saveMoments(data); wc_closePop(); wc_showToast("Post deleted.");
    
    if(document.getElementById('v-explore').classList.contains('on')) wc_renderMoments();
    if(document.getElementById('v-favs').classList.contains('on')) wc_renderFavs();
    if(document.getElementById('v-post-detail').classList.contains('on')) {
         wc_switch(window.wc_prev_view, document.getElementById('tab-' + window.wc_prev_view));
         if (window.wc_prev_view === 'explore') wc_renderMoments();
         if (window.wc_prev_view === 'favs') wc_renderFavs();
    }
};

window.wc_editPost = function() {
    window.wc_editing_post_id = window.wc_current_action_id;
    let post = wc_getMoments().find(p => p.id === window.wc_editing_post_id);
    if(post) { wc_closePop(); wc_openCompose(post); }
};

window.wc_renderMoments = function() {
  const data = wc_getMoments();
  const box = document.getElementById('x-stream');
  if(data.length === 0) { box.innerHTML = `<div style="padding:40px; text-align:center; color:var(--muted);">No posts yet.</div>`; return; }
  box.innerHTML = data.slice().reverse().map(p => wc_buildPostHtml(p, false)).join('');
};

window.wc_renderFavs = function() {
  const data = wc_getMoments().filter(p => p.isBookmarked);
  const box = document.getElementById('fav-stream');
  if(data.length === 0) { box.innerHTML = `<div style="padding:60px 20px; text-align:center; color:var(--muted);">No favorites yet.</div>`; return; }
  box.innerHTML = data.slice().reverse().map(p => wc_buildPostHtml(p, false)).join('');
};

// 详情页渲染
window.wc_renderPostDetail = function() {
  const data = wc_getMoments();
  const p = data.find(x => x.id === window.wc_current_post_id);
  if(!p) return;
  
  document.getElementById('pd-main-post').innerHTML = wc_buildPostHtml(p, true);
  
  // 渲染底部评论列表
  let commentsHtml = '';
  if (p.comments && p.comments.length > 0) {
    commentsHtml = p.comments.map(c => {
      const safeName = c.name.replace(/'/g, "\\'");
      // 正则匹配 @用户名 并高亮为 X 的蓝色风格
      let highlightedText = c.text.replace(/(@[^\s:，。！]+)/g, '<span style="color: var(--accent); font-weight: 500;">$1</span>');
      
      return `
      <div class="pd-reply-item" onclick="wc_prepReply('${safeName}')">
        <img src="${c.avatar || window.wc_my_info.avatar}" class="pd-reply-av">
        <div class="pd-reply-main">
          <div class="pd-reply-name">${c.name}</div>
          <div class="pd-reply-text">${highlightedText}</div>
        </div>
      </div>
      `;
    }).join('');
  } else {
    commentsHtml = `<div style="padding:40px; text-align:center; color:var(--muted); font-size:14px;">No replies yet.</div>`;
  }
  document.getElementById('pd-comments-box').innerHTML = commentsHtml;
};

// ================= 生成帖子 HTML (通用) =================
window.wc_buildPostHtml = function(p, isDetail) {
  let authorName = p.authorName; let authorHandle = p.authorHandle; let avatar = p.avatar;
  if(p.authorId === 'me') { authorName = window.wc_my_info.name; authorHandle = window.wc_my_info.handle; avatar = window.wc_my_info.avatar; }

  let imgHtml = '';
  let images = p.images || (p.image ? [p.image] : []);
  if (images.length > 0) {
    let cols = images.length === 1 ? '1fr' : '1fr 1fr';
    imgHtml = `<div class="x-img-grid" style="grid-template-columns: ${cols};" onclick="event.stopPropagation()">` + images.map(src => `<img src="${src}">`).join('') + `</div>`;
  }

  const likeClass = p.isLiked ? 'act-like liked' : 'act-like';
  const likeIcon = p.isLiked ? `<svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.7 0l-1.1 1-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1 7.8 7.8 7.8-7.7 1-1.1a5.5 5.5 0 0 0 0-7.8z"/></svg>` : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.7 0l-1.1 1-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1 7.8 7.8 7.8-7.7 1-1.1a5.5 5.5 0 0 0 0-7.8z"/></svg>`;
  const favClass = p.isBookmarked ? 'act-fav fav' : 'act-fav';
  const favIcon = p.isBookmarked ? `<svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>` : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`;

  const clickEvent = isDetail ? '' : `onmousedown="wc_lpDown(event, '${p.id}')" onmouseup="wc_lpUp()" onmouseleave="wc_lpUp()" ontouchstart="wc_lpDown(event, '${p.id}')" ontouchend="wc_lpUp()" ontouchmove="wc_lpUp()" onclick="wc_postClick(event, '${p.id}')"`;
  const wrapperStyle = isDetail ? 'border-bottom: 1px solid var(--sep); background:#fff;' : '';
  const contentStyle = isDetail ? 'font-size: 16px; line-height: 1.5; margin-top: 8px;' : '';

  return `
    <div class="x-post" style="${wrapperStyle}" ${clickEvent}>
      <img src="${avatar}" class="x-av" onerror="this.src='';this.style.background='#EEE'">
      <div class="x-main">
        <div class="x-user-info"><span class="x-name">${authorName}</span><span class="x-time">@${authorHandle} · ${p.time}</span></div>
        <div class="x-content" style="${contentStyle}">${p.content}</div>
        ${imgHtml}
        <div class="x-actions" onclick="event.stopPropagation()">
          <div class="x-act-item act-cmt" onclick="${isDetail ? `document.getElementById('pd-inp-val').focus()` : `wc_postClick(event, '${p.id}')`}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> ${p.comments ? p.comments.length : 0}</div>
          <div class="x-act-item act-rt" onclick="wc_openShare('${p.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3"/></svg></div>
          <div class="x-act-item ${likeClass}" onclick="wc_toggleLike('${p.id}')">${likeIcon} ${p.likes}</div>
          <div class="x-act-item ${favClass}" onclick="wc_toggleBookmark('${p.id}')">${favIcon}</div>
        </div>
      </div>
    </div>
  `;
};

// ================= 交互功能 (点赞/收藏/评论详情) =================

window.wc_prepReply = function(name) {
  const inp = document.getElementById('pd-inp-val');
  inp.value = `Reply to @${name}: `;
  inp.focus();
  wc_checkReplyInp();
};

window.wc_toggleLike = function(id) {
  let data = wc_getMoments(); let post = data.find(p => p.id === id); if(!post) return;
  post.isLiked = !post.isLiked; post.likes += post.isLiked ? 1 : -1;
  wc_saveMoments(data);
  if (document.getElementById('v-post-detail').classList.contains('on')) wc_renderPostDetail();
  else if (document.getElementById('v-favs').classList.contains('on')) wc_renderFavs();
  else wc_renderMoments();
};

window.wc_toggleBookmark = function(id) {
  let data = wc_getMoments(); let post = data.find(p => p.id === id); if(!post) return;
  post.isBookmarked = !post.isBookmarked;
  wc_saveMoments(data);
  if (document.getElementById('v-post-detail').classList.contains('on')) wc_renderPostDetail();
  else if (document.getElementById('v-favs').classList.contains('on')) wc_renderFavs();
  else wc_renderMoments();
  wc_showToast(post.isBookmarked ? "Saved to Favorites" : "Removed");
};

window.wc_checkReplyInp = function() {
  const v = document.getElementById('pd-inp-val').value.trim();
  document.getElementById('pd-btn-reply').style.display = v ? 'block' : 'none';
};

window.wc_submitReply = function() {
  const val = document.getElementById('pd-inp-val').value.trim(); if(!val) return;
  let data = wc_getMoments(); let post = data.find(p => p.id === window.wc_current_post_id);
  if(post) {
    if(!post.comments) post.comments = [];
    post.comments.push({ name: window.wc_my_info.name, avatar: window.wc_my_info.avatar, text: val });
    wc_saveMoments(data);
    wc_renderPostDetail();
  }
  document.getElementById('pd-inp-val').value = ''; wc_checkReplyInp();
  setTimeout(() => document.getElementById('v-post-detail').scrollTop = document.getElementById('v-post-detail').scrollHeight, 50);
};

// 转发 (选角色)
window.wc_openShare = function(id) {
  window.wc_current_action_id = id; document.getElementById('pop-title').innerText = "Share";
  const mainChars = JSON.parse(localStorage.getItem('ai_chars_safe') || '[]').filter(c => c.role === 'main');
  if(mainChars.length === 0) { document.getElementById('pop-content').innerHTML = `<div style="padding:20px;color:var(--muted);font-size:14px;">No contacts to share with.</div>`; document.getElementById('pop-btns').innerHTML = `<div class="pop-btn btn-cancel" onclick="wc_closePop()">Close</div>`; } 
  else {
    document.getElementById('pop-content').innerHTML = `<div class="pop-list">` + mainChars.map(c => `<div class="pop-list-item" onclick="wc_closePop();wc_showToast('Shared to ${c.name} ✨')"><img src="${c.avatar}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;"><span style="font-weight:700;font-size:15px;">${c.name}</span></div>`).join('') + `</div>`;
    document.getElementById('pop-btns').innerHTML = `<div class="pop-btn btn-cancel" onclick="wc_closePop()">Cancel</div>`;
  }
  document.getElementById('pop-box').style.display = 'flex';
};

// ================= 发布/编辑动态 (Compose) =================

window.wc_openCompose = function(editPost = null) {
  if(editPost && editPost.id) {
    document.getElementById('cp-text').value = editPost.content;
    window.wc_temp_post_imgs = editPost.images || (editPost.image ? [editPost.image] : []);
    window.wc_editing_post_id = editPost.id;
  } else {
    document.getElementById('cp-text').value = "";
    window.wc_temp_post_imgs = [];
    window.wc_editing_post_id = null;
  }
  wc_renderCpImgs();
  document.getElementById('v-compose').classList.add('on');
};
window.wc_closeCompose = function() { document.getElementById('v-compose').classList.remove('on'); };

window.wc_renderCpImgs = function() {
    const grid = document.getElementById('cp-img-grid');
    grid.innerHTML = window.wc_temp_post_imgs.map((src, index) => `<div class="cp-img-item"><img src="${src}"><div class="cp-img-del" onclick="wc_removeCpImg(${index})">×</div></div>`).join('');
};
window.wc_removeCpImg = function(idx) { window.wc_temp_post_imgs.splice(idx, 1); wc_renderCpImgs(); };

window.wc_handlePostImg = function(input) {
  const file = input.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image(); img.src = e.target.result;
    img.onload = () => {
      const cvs = document.createElement('canvas'); const ctx = cvs.getContext('2d');
      const maxW = 1080; let w = img.width, h = img.height;
      if(w > maxW) { h *= maxW/w; w = maxW; }
      cvs.width = w; cvs.height = h; ctx.drawImage(img, 0,0, w, h);
      window.wc_temp_post_imgs.push(cvs.toDataURL('image/jpeg', 0.85));
      wc_renderCpImgs();
    };
  };
  reader.readAsDataURL(file);
  input.value = ""; 
};

window.wc_submitPost = function() {
  const text = document.getElementById('cp-text').value.trim();
  if(!text && window.wc_temp_post_imgs.length === 0) return wc_showToast('Cannot be empty!');
  
  let data = wc_getMoments();
  if(window.wc_editing_post_id) {
      let post = data.find(p => p.id === window.wc_editing_post_id);
      if(post) { post.content = text; post.images = window.wc_temp_post_imgs; }
      wc_showToast('Post updated!');
  } else {
      data.push({
        id: 'm_' + Date.now(), authorId: 'me',
        authorName: window.wc_my_info.name, authorHandle: window.wc_my_info.handle, avatar: window.wc_my_info.avatar,
        content: text, images: window.wc_temp_post_imgs, time: 'Just now', likes: 0, isLiked: false, comments: [], isBookmarked: false
      });
      wc_showToast('Posted!');
  }
  
  wc_saveMoments(data); wc_closeCompose(); 
  
  if (document.getElementById('v-post-detail').classList.contains('on')) {
      wc_renderPostDetail();
  } else if (document.getElementById('v-favs').classList.contains('on')) {
      wc_renderFavs();
  } else {
      wc_renderMoments();
  }
};
