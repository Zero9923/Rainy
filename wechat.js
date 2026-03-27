// wechat.js - 极致 iOS 原生黑白高级版 + 真·AI API 聊天大脑

function renderWechat() {
    try {
        const appLayer = document.getElementById('app-layer');
        if (!appLayer) return;
        
        appLayer.innerHTML = `
            <style>
                /* ================== 苹果原生全局定义 ================== */
                :root {
                    --bg-color: #F2F2F7;
                    --card-color: #FFFFFF;
                    --text-main: #000000;
                    --text-sub: #8E8E93;
                    --separator: rgba(60, 60, 67, 0.29);
                    --accent: #000000;
                }
                
                .wc-container * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif; -webkit-tap-highlight-color: transparent; }
                .wc-container { width: 100vw; height: 100vh; background: var(--bg-color); position: relative; display: flex; flex-direction: column; overflow: hidden; color: var(--text-main); }
                
                .wc-icon { stroke: var(--text-main); stroke-width: 1.5; fill: none; stroke-linecap: round; stroke-linejoin: round; display: block; }
                
                /* ================== 顶部导航条 ================== */
                .wc-top-bar { 
                    height: calc(44px + env(safe-area-inset-top, 20px)); padding-top: env(safe-area-inset-top, 20px); 
                    background: rgba(242, 242, 247, 0.8); backdrop-filter: blur(20px) saturate(180%); -webkit-backdrop-filter: blur(20px) saturate(180%); 
                    display: flex; align-items: center; justify-content: center; position: absolute; top: 0; width: 100%; z-index: 100; 
                    border-bottom: 0.5px solid var(--separator);
                }
                .wc-top-bar .wc-title { font-size: 17px; font-weight: 600; letter-spacing: -0.3px; display: flex; flex-direction: column; align-items: center; justify-content: center;}
                .wc-typing-text { font-size: 10px; font-weight: 400; color: var(--text-sub); opacity: 0; transition: 0.2s; height: 0; }
                .wc-typing-text.active { opacity: 1; height: 12px; margin-top: 2px;}

                .wc-left-action, .wc-right-action { position: absolute; cursor: pointer; display: flex; align-items: center; padding: 10px 16px; color: var(--accent); font-size: 16px; font-weight: 400;}
                .wc-left-action { left: 0; } .wc-right-action { right: 0; }

                /* ================== 视图容器 ================== */
                .wc-view-layer { flex: 1; width: 100%; height: 100vh; overflow-y: auto; overflow-x: hidden; display: none; padding-top: calc(44px + env(safe-area-inset-top, 20px)); padding-bottom: 110px; }
                .wc-view-layer.active { display: block; animation: iosFadeIn 0.25s ease-out forwards; }
                @keyframes iosFadeIn { from { opacity: 0; } to { opacity: 1; } }
                .wc-view-layer::-webkit-scrollbar { display: none; }

                .ios-large-title { font-size: 28px; font-weight: 700; letter-spacing: -0.8px; padding: 8px 14px 4px; color: var(--text-main); }

                .wc-search-container { padding: 4px 14px 8px; }
                .wc-search-bar { background: rgba(118, 118, 128, 0.12); border-radius: 8px; height: 32px; display: flex; align-items: center; padding: 0 8px; }
                .wc-search-bar input { border: none; outline: none; background: transparent; flex: 1; font-size: 15px; margin-left: 6px; color: var(--text-main); }
                .wc-search-bar input::placeholder { color: var(--text-sub); }

                .segmented-control-wrap { padding: 0 14px 12px; }
                .segmented-control { display: flex; background: rgba(118, 118, 128, 0.12); border-radius: 6px; padding: 2px; }
                .seg-item { flex: 1; text-align: center; font-size: 12px; font-weight: 500; padding: 5px 0; border-radius: 5px; cursor: pointer; transition: 0.2s; color: var(--text-main); }
                .seg-item.active { background: var(--card-color); box-shadow: 0 3px 8px rgba(0,0,0,0.12), 0 3px 1px rgba(0,0,0,0.04); font-weight: 600; }

                /* ================== Inset Grouped List ================== */
                .ios-list-group { background: var(--card-color); border-radius: 10px; margin: 0 14px 18px; overflow: hidden; }
                .ios-list-item { display: flex; align-items: center; padding: 8px 14px; position: relative; cursor: pointer; transition: background 0.15s; background: var(--card-color);}
                .ios-list-item:active { background: #E5E5EA; }
                .ios-list-item:not(:last-child)::after { content: ''; position: absolute; bottom: 0; left: 56px; right: 0; border-bottom: 0.5px solid var(--separator); }
                
                .group-header { padding: 0 28px 4px; font-size: 12px; font-weight: 400; color: var(--text-sub); text-transform: uppercase; }

                .list-avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
                .list-icon { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; margin-right: 12px; }
                .list-icon svg { width: 20px; height: 20px; }
                
                .list-info { flex: 1; margin-left: 12px; display: flex; flex-direction: column; justify-content: center; overflow: hidden; padding: 2px 0;}
                .list-top { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2px; }
                .list-name { font-size: 15px; font-weight: 600; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; letter-spacing: -0.2px;}
                .list-time { font-size: 13px; color: var(--text-sub); font-weight: 400;}
                .list-msg { font-size: 13px; color: var(--text-sub); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                
                .list-title { flex: 1; font-size: 15px; font-weight: 400; color: var(--text-main); letter-spacing: -0.2px;}
                .list-arrow { color: #C7C7CC; margin-left: 8px;}

                /* ================== 模块3 & 4 ================== */
                .moment-feed { padding: 10px 0 20px; }
                .moment-card { background: var(--card-color); padding: 16px 14px; margin-bottom: 10px; border-top: 0.5px solid var(--separator); border-bottom: 0.5px solid var(--separator);}
                .moment-header { display: flex; align-items: center; margin-bottom: 10px; }
                .moment-avatar { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; margin-right: 10px; }
                .moment-name { font-size: 15px; font-weight: 600; color: var(--text-main); letter-spacing: -0.2px;}
                .moment-text { font-size: 14px; color: var(--text-main); line-height: 1.4; margin-bottom: 10px; letter-spacing: -0.1px;}
                .moment-img { width: 100%; border-radius: 6px; object-fit: cover; }
                .moment-time { font-size: 12px; color: var(--text-sub); margin-top: 10px; }

                .profile-header { display: flex; align-items: center; padding: 16px 14px 24px; }
                .profile-avatar { width: 56px; height: 56px; border-radius: 50%; object-fit: cover; margin-right: 14px; }
                .profile-info { flex: 1; }
                .profile-name { font-size: 22px; font-weight: 700; color: var(--text-main); letter-spacing: -0.4px; margin-bottom: 2px;}
                .profile-id { font-size: 13px; color: var(--text-sub); }

                /* ================== 底部导航栏 ================== */
                .wc-tab-bar {
                    position: absolute; bottom: 0; width: 100%; height: calc(46px + env(safe-area-inset-bottom, 15px));
                    padding-bottom: env(safe-area-inset-bottom, 15px);
                    background: rgba(242, 242, 247, 0.85); backdrop-filter: blur(30px) saturate(200%); -webkit-backdrop-filter: blur(30px) saturate(200%);
                    border-top: 0.5px solid rgba(0,0,0,0.1);
                    display: flex; justify-content: space-around; align-items: center; z-index: 150;
                }
                .wc-tab-item { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 60px; height: 46px; cursor: pointer; color: #999999; }
                .wc-tab-item svg { width: 22px; height: 22px; margin-bottom: 2px; }
                .wc-tab-text { font-size: 9px; font-weight: 500; }
                .wc-tab-item.active { color: var(--accent); }
                .wc-tab-item.active svg { stroke-width: 2; }

                /* ================== 聊天室 (核心) ================== */
                .wc-chat-room { position: absolute; top: 0; left: 0; width: 100vw; height: 100vh; background: var(--card-color); z-index: 999; transform: translateX(100%); transition: transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1); display: flex; flex-direction: column; }
                .wc-chat-room.active { transform: translateX(0); }
                
                .chat-box-inner { flex: 1; overflow-y: auto; padding: 16px 14px; display: flex; flex-direction: column; gap: 14px; margin-top: calc(44px + env(safe-area-inset-top, 20px)); background: var(--card-color);}
                .chat-box-inner::-webkit-scrollbar { display: none; }
                .time-stamp { text-align: center; margin: 8px 0; } 
                .time-stamp span { font-size: 11px; font-weight: 500; color: var(--text-sub); }
                
                .msg-row { display: flex; width: 100%; align-items: flex-end; } 
                .bubble { max-width: 75%; padding: 8px 14px; font-size: 15px; line-height: 1.4; word-wrap: break-word; letter-spacing: -0.2px; border-radius: 16px;}
                
                .msg-left { flex-direction: row; } 
                .msg-left .bubble { background: #E9E9EB; color: #000; border-bottom-left-radius: 4px; }
                
                .msg-right { flex-direction: row-reverse; } 
                .msg-right .bubble { background: #000000; color: #fff; border-bottom-right-radius: 4px; }
                
                /* ================== 输入框与【接收键】 ================== */
                .input-bar { background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(20px); padding: 8px 14px; padding-bottom: calc(8px + env(safe-area-inset-bottom, 15px)); display: flex; align-items: center; border-top: 0.5px solid rgba(0,0,0,0.1); gap: 10px; }
                .icon-btn { color: var(--text-sub); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.1s;}
                .icon-btn:active { opacity: 0.6; }
                .icon-btn svg { width: 22px; height: 22px; }
                .input-area { flex: 1; background-color: rgba(0,0,0,0.05); height: 32px; border-radius: 16px; border: none; padding: 0 12px; font-size: 15px; outline: none; color: #000; }
                .send-btn { background: #000; color: #fff; border: none; border-radius: 14px; padding: 0 14px; height: 28px; font-size: 13px; font-weight: 600; display: none; }
                
                /* 魔法接收键 (高级紫色渐变特效) */
                .ai-receive-btn { color: #000; font-weight: 600; font-size: 13px; display: flex; align-items: center; justify-content: center; border-radius: 14px; padding: 0 12px; height: 28px; background: rgba(0,0,0,0.05); cursor: pointer;}
                .ai-receive-btn svg { width: 14px; height: 14px; margin-right: 4px; stroke-width: 2;}

                /* Toast 提示 */
                .wc-toast { position: fixed; top: 100px; left: 50%; transform: translateX(-50%); background: rgba(30,30,30,0.85); backdrop-filter: blur(10px); color: #fff; padding: 12px 24px; border-radius: 24px; font-size: 14px; font-weight: 500; pointer-events: none; opacity: 0; transition: 0.3s; z-index: 9999; text-align: center; max-width: 90%;}
                .wc-toast.show { opacity: 1; }
            </style>

            <div class="wc-container">
                
                <!-- ================= 模块1：消息 ================= -->
                <div id="wc-view-messages" class="wc-view-layer active">
                    <div class="wc-top-bar" style="background:var(--bg-color); border:none; backdrop-filter:none;">
                        <div class="wc-left-action" onclick="closeApp()">Edit</div>
                        <div class="wc-right-action"><svg class="wc-icon" viewBox="0 0 24 24" style="width:20px;height:20px;"><path d="M12 4v16m8-8H4"/></svg></div>
                    </div>
                    
                    <div class="ios-large-title">Messages</div>

                    <div class="wc-search-container">
                        <div class="wc-search-bar"><svg class="wc-icon" viewBox="0 0 24 24" style="width:14px;height:14px;color:#8e8e93;"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg><input type="text" placeholder="Search"></div>
                    </div>

                    <div class="segmented-control-wrap">
                        <div class="segmented-control">
                            <div class="seg-item active" onclick="wc_toggleSeg(this)">All</div>
                            <div class="seg-item" onclick="wc_toggleSeg(this)">Unread</div>
                            <div class="seg-item" onclick="wc_toggleSeg(this)">Starred</div>
                        </div>
                    </div>

                    <div class="ios-list-group" style="margin-bottom: 20px;">
                        <div class="ios-list-item" onclick="wc_openChat('沈星回')">
                            <img src="https://image.uglycat.cc/crabxl.png" class="list-avatar">
                            <div class="list-info">
                                <div class="list-top"><div class="list-name">沈星回</div><div class="list-time">08:30</div></div>
                                <div class="list-msg">Are you awake?</div>
                            </div>
                        </div>
                        <div class="ios-list-item">
                            <img src="https://image.uglycat.cc/at03ir.png" class="list-avatar">
                            <div class="list-info">
                                <div class="list-top"><div class="list-name">File Transfer</div><div class="list-time">Yesterday</div></div>
                                <div class="list-msg">Photo</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ================= 模块2：通讯录 ================= -->
                <div id="wc-view-contacts" class="wc-view-layer">
                    <div class="wc-top-bar" style="background:var(--bg-color); border:none; backdrop-filter:none;">
                        <div class="wc-right-action"><svg class="wc-icon" viewBox="0 0 24 24" style="width:20px;height:20px;"><path d="M12 4v16m8-8H4"/></svg></div>
                    </div>
                    
                    <div class="ios-large-title">Contacts</div>
                    <div class="wc-search-container" style="padding-bottom:12px;"><div class="wc-search-bar"><svg class="wc-icon" viewBox="0 0 24 24" style="width:14px;height:14px;color:#8e8e93;"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg><input type="text" placeholder="Search"></div></div>
                    
                    <div class="ios-list-group">
                        <div class="ios-list-item">
                            <div class="list-icon"><svg class="wc-icon" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="17" y1="11" x2="23" y2="11"/></svg></div>
                            <div class="list-title">New Friends</div>
                        </div>
                    </div>
                    
                    <div class="group-header">Starred</div>
                    <div class="ios-list-group">
                        <div class="ios-list-item" onclick="wc_openChat('沈星回')">
                            <img src="https://image.uglycat.cc/crabxl.png" class="list-avatar" style="width:40px;height:40px;margin-right:16px;">
                            <div class="list-title">沈星回</div>
                        </div>
                    </div>
                </div>

                <!-- ================= 模块3：动态 ================= -->
                <div id="wc-view-moments" class="wc-view-layer">
                    <div class="wc-top-bar" style="background:var(--bg-color); border:none; backdrop-filter:none;">
                        <div class="wc-right-action"><svg class="wc-icon" viewBox="0 0 24 24" style="width:20px;height:20px;"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></div>
                    </div>
                    
                    <div class="ios-large-title">Explore</div>
                    
                    <div class="moment-feed">
                        <div class="moment-card">
                            <div class="moment-header">
                                <img src="https://image.uglycat.cc/crabxl.png" class="moment-avatar">
                                <div class="moment-name">沈星回</div>
                            </div>
                            <div class="moment-text">Perfect weather today.</div>
                            <img src="https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&q=80" class="moment-img">
                            <div class="moment-time">1 hour ago</div>
                        </div>
                    </div>
                </div>

                <!-- ================= 模块4：设置 ================= -->
                <div id="wc-view-me" class="wc-view-layer">
                    <div class="wc-top-bar" style="background:var(--bg-color); border:none; backdrop-filter:none;"></div>
                    <div class="ios-large-title" style="margin-bottom:10px;">Settings</div>

                    <div class="profile-header">
                        <img src="https://image.uglycat.cc/at03ir.png" class="profile-avatar">
                        <div class="profile-info">
                            <div class="profile-name">MyName</div>
                            <div class="profile-id">ID: private_001</div>
                        </div>
                    </div>
                    
                    <div class="ios-list-group">
                        <div class="ios-list-item">
                            <div class="list-icon"><svg class="wc-icon" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2" ry="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
                            <div class="list-title">Wallet & Services</div>
                            <div class="list-arrow"><svg class="wc-icon" viewBox="0 0 24 24" style="width:16px;height:16px;"><path d="M9 18l6-6-6-6"/></svg></div>
                        </div>
                    </div>
                </div>

                <!-- ================= iOS 原生底部导航栏 ================= -->
                <div class="wc-tab-bar">
                    <div class="wc-tab-item active" onclick="wc_switchView('messages', this)">
                        <svg class="wc-icon" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                        <div class="wc-tab-text">Chats</div>
                    </div>
                    <div class="wc-tab-item" onclick="wc_switchView('contacts', this)">
                        <svg class="wc-icon" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        <div class="wc-tab-text">Contacts</div>
                    </div>
                    <div class="wc-tab-item" onclick="wc_switchView('moments', this)">
                        <svg class="wc-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
                        <div class="wc-tab-text">Explore</div>
                    </div>
                    <div class="wc-tab-item" onclick="wc_switchView('me', this)">
                        <svg class="wc-icon" viewBox="0 0 24 24"><circle cx="12" cy="7" r="4"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/></svg>
                        <div class="wc-tab-text">Settings</div>
                    </div>
                </div>

                <!-- ================= 真·AI 聊天室 ================= -->
                <div class="wc-chat-room" id="wc-chat-room">
                    <div class="wc-top-bar" style="background:rgba(255,255,255,0.85);">
                        <div class="wc-left-action" onclick="wc_closeChat()">
                            <svg class="wc-icon" viewBox="0 0 24 24" style="width:20px;height:20px;stroke:var(--accent);"><path d="M15 18l-6-6 6-6"/></svg>
                            <span style="color:var(--accent); margin-left:-4px;">Chats</span>
                        </div>
                        <div class="wc-title" id="wc-chat-title" style="font-size:15px;">
                            <div id="wc-chat-name">沈星回</div>
                            <div class="wc-typing-text" id="wc-typing">对方正在输入...</div>
                        </div>
                        <div class="wc-right-action"><svg class="wc-icon" viewBox="0 0 24 24" style="width:20px;height:20px;stroke:var(--accent);"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg></div>
                    </div>
                    
                    <div class="chat-box-inner" id="wc-chat-box">
                        <div class="time-stamp"><span>Today 08:30</span></div>
                        <div class="msg-row msg-left"><div class="bubble">早安！吃早餐了吗？</div></div>
                    </div>
                    
                    <div class="input-bar">
                        <div class="icon-btn"><svg class="wc-icon" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></div>
                        <input type="text" class="input-area" id="wc-chat-input" oninput="wc_checkInput()" placeholder="iMessage">
                        
                        <button class="send-btn" id="wc-send-btn" onclick="wc_sendMessage()">Send</button>
                        
                        <!-- 专属神级接收键 (平时隐藏，有API且没打字时显示) -->
                        <div class="ai-receive-btn" id="wc-ai-btn" onclick="wc_receiveAiMessage()">
                            <svg class="wc-icon" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                            接收
                        </div>
                    </div>
                </div>

                <div class="wc-toast" id="wc-sys-toast"></div>
            </div>
        `;

        document.getElementById('wc-chat-input').addEventListener('keypress', function (e) {
            if (e.key === 'Enter') wc_sendMessage();
        });

        // 初始化时检查是否配置了 API，如果有则显示接收键
        wc_checkInput();

    } catch (err) {
        alert("Render Error: " + err.message);
    }
}

// ================= 全局上下文变量：记忆存储 =================
window.wc_chatHistory = [
    { role: "system", content: "你现在在和一个女孩子进行微信聊天，你的名字叫沈星回。请用宠溺、日常、简短的微信聊天口吻回复她。绝不要输出长篇大论。" },
    { role: "assistant", content: "早安！吃早餐了吗？" }
];

// ================= 交互逻辑 =================
function wc_switchView(viewName, el) {
    document.querySelectorAll('.wc-view-layer').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.wc-tab-item').forEach(n => n.classList.remove('active'));
    document.getElementById('wc-view-' + viewName).classList.add('active');
    el.classList.add('active');
}

function wc_toggleSeg(el) {
    document.querySelectorAll('.seg-item').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
}

function wc_openChat(name) {
    document.getElementById('wc-chat-name').innerText = name;
    document.getElementById('wc-chat-room').classList.add('active');
    wc_scrollToBottom();
}

function wc_closeChat() {
    document.getElementById('wc-chat-room').classList.remove('active');
}

function wc_scrollToBottom() {
    const box = document.getElementById('wc-chat-box');
    box.scrollTop = box.scrollHeight;
}

function wc_showToast(msg) {
    const toast = document.getElementById('wc-sys-toast');
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 2000);
}

function wc_checkInput() {
    const input = document.getElementById('wc-chat-input');
    const sendBtn = document.getElementById('wc-send-btn');
    const aiBtn = document.getElementById('wc-ai-btn');
    const plusBtn = document.querySelector('.input-bar .icon-btn'); // 简单处理加号

    // 如果正在打字，显示发送键，隐藏其他
    if (input.value.trim().length > 0) {
        sendBtn.style.display = 'block';
        aiBtn.style.display = 'none';
        plusBtn.style.display = 'none';
    } else {
        sendBtn.style.display = 'none';
        plusBtn.style.display = 'flex';
        // 如果没有打字，一直显示接收键！
        aiBtn.style.display = 'flex';
    }
}

// 仅仅是用户把消息发出去，存进记忆，AI 不会自动回复！
function wc_sendMessage() {
    const input = document.getElementById('wc-chat-input');
    const text = input.value.trim();
    if (!text) return;

    // 我的气泡：极致黑
    const myMsg = `<div class="msg-row msg-right"><div class="bubble">${text}</div></div>`;
    document.getElementById('wc-chat-box').insertAdjacentHTML('beforeend', myMsg);
    
    // 存入真实记忆
    window.wc_chatHistory.push({ role: "user", content: text });

    input.value = '';
    wc_checkInput();
    wc_scrollToBottom();
}

// ================= 真·AI API 调用 =================
async function wc_receiveAiMessage() {
    // 1. 从刚才设置页保存在本地的数据里拿取 API
    const apiUrl = localStorage.getItem('api_url');
    const apiKey = localStorage.getItem('api_key');
    const apiModel = localStorage.getItem('api_model');

    // 2. 防呆校验：如果没有配置，提醒用户
    if (!apiUrl || !apiKey || !apiModel) {
        wc_showToast("请先在桌面【设置】里配置 General API！");
        return;
    }

    const aiBtn = document.getElementById('wc-ai-btn');
    const typingStatus = document.getElementById('wc-typing');

    // 按钮禁用，显示打字状态
    aiBtn.style.pointerEvents = 'none';
    aiBtn.style.opacity = '0.5';
    typingStatus.classList.add('active');

    try {
        let endpoint = apiUrl.endsWith('/chat/completions') ? apiUrl : (apiUrl.endsWith('/') ? apiUrl + 'chat/completions' : apiUrl + '/chat/completions');

        // 发送真实的携带上下文请求
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: apiModel,
                messages: window.wc_chatHistory
            })
        });

        if (!response.ok) throw new Error("接口返回错误");

        const data = await response.json();
        const replyText = data.choices[0].message.content;

        // 存入记忆
        window.wc_chatHistory.push({ role: "assistant", content: replyText });

        // 渲染对方气泡
        const charMsg = `<div class="msg-row msg-left"><div class="bubble">${replyText}</div></div>`;
        document.getElementById('wc-chat-box').insertAdjacentHTML('beforeend', charMsg);
        wc_scrollToBottom();

    } catch (err) {
        console.error("API 请求失败", err);
        // 如果跨域被拦截，或者网络报错，为了防止冷场，强行兜底一条回复
        wc_showToast("API 跨域或请求失败，进入离线模拟模式");
        
        let fakeReply = "宝宝你说得对！";
        if (window.wc_chatHistory.length > 2) {
            const lastUserMsg = window.wc_chatHistory[window.wc_chatHistory.length - 1].content;
            if (lastUserMsg.includes('想')) fakeReply = "我也想你。";
            else if (lastUserMsg.includes('吗')) fakeReply = "当然啦。";
        }
        
        window.wc_chatHistory.push({ role: "assistant", content: fakeReply });
        const charMsg = `<div class="msg-row msg-left"><div class="bubble">${fakeReply}</div></div>`;
        document.getElementById('wc-chat-box').insertAdjacentHTML('beforeend', charMsg);
        wc_scrollToBottom();
        
    } finally {
        // 恢复状态
        aiBtn.style.pointerEvents = 'auto';
        aiBtn.style.opacity = '1';
        typingStatus.classList.remove('active');
    }
}
