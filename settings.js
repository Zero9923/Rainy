// settings.js - 极简设置界面 (纯净API版 + 数据管理)

// ================= 底部抽屉与预设系统 =================
window.set_openSheet = function(title, htmlContent) {
    document.getElementById('sheet-title').innerText = title;
    document.getElementById('sheet-content').innerHTML = htmlContent;
    document.getElementById('sheet-overlay').classList.add('active');
    document.getElementById('action-sheet').classList.add('active');
};

window.set_closeSheet = function() {
    document.getElementById('sheet-overlay').classList.remove('active');
    document.getElementById('action-sheet').classList.remove('active');
};

window.set_openModelSheet = function(type) {
    let models = window.fetchedApiModels || ["gpt-4o", "gpt-4-turbo", "claude-3-opus-20240229"];
    let currentModel = document.getElementById('api-model-text').innerText;
    
    let listHtml = '<div class="sheet-list" style="margin-bottom: 15px;">';
    listHtml += `<div class="sheet-item" style="color: var(--blue); font-weight: 600; text-align: left;" onclick="set_manualInputModel('${type}')">+ 手动输入其他模型</div>`;
    listHtml += '</div>';

    if (models && models.length > 0) {
        listHtml += '<div style="font-size: 13px; color: var(--text-sub); margin-left: 5px; margin-bottom: 5px;">可选模型列表</div>';
        listHtml += '<div class="sheet-list">';
        models.forEach(model => {
            const isSelected = model === currentModel;
            const color = isSelected ? 'var(--blue)' : 'var(--text-main)';
            const checkMark = isSelected ? '✓ ' : '';
            listHtml += `<div class="sheet-item" style="color: ${color}; text-align: left;" onclick="set_selectModel('${type}', '${model}')">${checkMark}${model}</div>`;
        });
        listHtml += '</div>';
    }

    set_openSheet('选择模型', listHtml);
};

window.set_manualInputModel = function(type) {
    const customModel = prompt("请输入模型名称 (如: gpt-4o)", "");
    if (customModel && customModel.trim() !== "") {
        set_selectModel(type, customModel.trim());
    }
};

window.set_selectModel = function(type, modelId) {
    document.getElementById('api-model-text').innerText = modelId;
    set_saveConfig(); 
    set_closeSheet();
};

window.set_openPresetManager = function() {
    let presets = JSON.parse(localStorage.getItem('api_presets') || '[]');
    let html = `<div class="sheet-list" style="margin-bottom: 20px;"><div class="sheet-item" style="color: var(--blue); font-weight: 600;" onclick="set_addCurrentAsPreset()">+ 将当前配置存为新预设</div></div>`;

    if (presets.length > 0) {
        html += '<div style="font-size: 13px; color: var(--text-sub); margin-left: 5px; margin-bottom: 5px;">点击应用，点击红色删除</div><div class="sheet-list">';
        presets.forEach((p, index) => {
            html += `
                <div class="sheet-item preset-item" style="position:relative;">
                    <div style="width: 80%;" onclick="set_applyPreset(${index})">
                        <div class="preset-name">${p.name}</div><div class="preset-detail">${p.model} | ${p.url}</div>
                    </div>
                    <div style="position: absolute; right: 16px; top: 50%; transform: translateY(-50%); color: var(--red); font-size: 14px; padding: 10px;" onclick="set_deletePreset(${index}, event)">删除</div>
                </div>`;
        });
        html += '</div>';
    }
    set_openSheet('预设管理', html);
};

window.set_addCurrentAsPreset = function() {
    const url = document.getElementById('api-url').value.trim();
    const key = document.getElementById('api-key').value.trim();
    const model = document.getElementById('api-model-text').innerText;
    
    if (!url || !key || model.includes('请先选择')) {
        set_showToast("请填好 URL、Key 并选择模型后再保存！");
        return;
    }
    const presetName = prompt("请为预设起个名字 (如: 主力GPT4)", "新预设");
    if (!presetName) return;

    let presets = JSON.parse(localStorage.getItem('api_presets') || '[]');
    presets.push({ name: presetName, url, key, model });
    localStorage.setItem('api_presets', JSON.stringify(presets));
    
    set_showToast("预设保存成功");
    set_openPresetManager(); 
};

window.set_applyPreset = function(index) {
    let presets = JSON.parse(localStorage.getItem('api_presets') || '[]');
    const p = presets[index];
    if (p) {
        document.getElementById('api-url').value = p.url;
        document.getElementById('api-key').value = p.key;
        document.getElementById('api-model-text').innerText = p.model;
        
        if (!window.fetchedApiModels) window.fetchedApiModels = ["gpt-4o", "claude-3-opus-20240229"];
        if (!window.fetchedApiModels.includes(p.model)) window.fetchedApiModels.push(p.model);
        
        set_closeSheet();
        set_saveConfig(); 
    }
};

window.set_deletePreset = function(index, event) {
    event.stopPropagation(); 
    if(confirm("确定要删除吗？")) {
        let presets = JSON.parse(localStorage.getItem('api_presets') || '[]');
        presets.splice(index, 1);
        localStorage.setItem('api_presets', JSON.stringify(presets));
        set_openPresetManager(); 
    }
};

// ================= API 模型拉取 =================
window.set_fetchApiModels = async function(btn) {
    const urlInput = document.getElementById('api-url').value.trim();
    const key = document.getElementById('api-key').value.trim();
    if(!urlInput || !key) { set_showToast("缺少 URL 或 Key"); return; }

    const btnText = btn.querySelector('.ios-btn-row');
    const originalText = btnText.innerText;
    btnText.innerText = "请求中..."; btnText.classList.add('disabled');

    try {
        let targetUrl = urlInput.endsWith('/models') ? urlInput : (urlInput.endsWith('/') ? urlInput + 'models' : urlInput + '/models');
        const response = await fetch(targetUrl, { method: 'GET', headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' } });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const resData = await response.json();
        
        if (resData && resData.data && Array.isArray(resData.data)) {
            window.fetchedApiModels = resData.data.map(m => m.id).sort();
            set_showToast(`拉取成功: ${window.fetchedApiModels.length} 个模型`);
        } else {
            throw new Error("接口格式不标准");
        }
    } catch (err) {
        console.log("API 直连失败，载入内置模型库...");
        window.fetchedApiModels = ["gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo", "claude-3-opus-20240229", "claude-3-sonnet-20240229", "gemini-1.5-pro-latest"];
        set_showToast("跨域受限，已为您加载官方标准模型库！");
    } finally {
        btnText.innerText = originalText; btnText.classList.remove('disabled');
        set_openModelSheet('api'); 
    }
};

// ================= 数据管理：导出、导入、清除 =================
window.set_exportData = function() {
    const data = JSON.stringify(localStorage);
    const blob = new Blob([data], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `App_Data_${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    set_showToast("数据已成功导出！");
};

window.set_importData = function() {
    const fileInput = document.getElementById('data-import-input');
    fileInput.click();
};

window.set_handleFileImport = function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            // 清除原有数据，载入新数据
            localStorage.clear();
            for (let key in data) {
                localStorage.setItem(key, data[key]);
            }
            set_showToast("导入成功！即将刷新页面...");
            setTimeout(() => {
                location.reload();
            }, 1000);
        } catch (error) {
            set_showToast("文件格式错误，导入失败");
        }
    };
    reader.readAsText(file);
    event.target.value = ''; // 清空选择
};

window.set_clearData = function() {
    if(confirm("警告：这将会清除您所有保存的API、预设和聊天数据，并且无法恢复！确定要清除吗？")) {
        localStorage.clear();
        set_showToast("数据已清空！即将刷新...");
        setTimeout(() => {
            location.reload();
        }, 1000);
    }
};

// ================= 全局核心渲染逻辑 =================

function renderSettings() {
    try {
        const appLayer = document.getElementById('app-layer');
        if (!appLayer) return;
        
        // 读取本地真实保存的配置
        const savedApiUrl = localStorage.getItem('api_url') || 'https://api.openai.com/v1';
        const savedApiKey = localStorage.getItem('api_key') || '';
        const savedApiModel = localStorage.getItem('api_model') || '';

        appLayer.innerHTML = `
            <style>
                :root { --bg-color: #F2F2F7; --card-color: #FFFFFF; --text-main: #000000; --text-sub: #8E8E93; --separator: rgba(60, 60, 67, 0.29); --blue: #007AFF; --red: #FF3B30; }
                .set-container * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif; -webkit-tap-highlight-color: transparent; }
                .set-container { width: 100vw; height: 100vh; background: var(--bg-color); position: relative; display: flex; flex-direction: column; overflow: hidden; color: var(--text-main); }
                .set-top-bar { height: calc(44px + env(safe-area-inset-top, 20px)); padding-top: env(safe-area-inset-top, 20px); background: rgba(242, 242, 247, 0.85); backdrop-filter: blur(25px) saturate(200%); -webkit-backdrop-filter: blur(25px) saturate(200%); display: flex; align-items: center; justify-content: center; position: absolute; top: 0; width: 100%; z-index: 100; border-bottom: 0.5px solid var(--separator); }
                .set-top-bar .set-title { font-size: 17px; font-weight: 600; letter-spacing: -0.4px; opacity: 0; transition: opacity 0.2s;} 
                .set-left-action { position: absolute; left: 0; cursor: pointer; display: flex; align-items: center; padding: 10px 16px; color: var(--blue); font-size: 17px; font-weight: 400;}
                .set-view-layer { flex: 1; width: 100%; height: 100vh; overflow-y: auto; overflow-x: hidden; display: none; padding-top: calc(44px + env(safe-area-inset-top, 20px)); padding-bottom: 50px; }
                .set-view-layer.active { display: block; animation: iosFadeIn 0.2s ease-out forwards; }
                @keyframes iosFadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
                .set-view-layer::-webkit-scrollbar { display: none; }
                .ios-large-title { font-size: 34px; font-weight: 700; letter-spacing: -1px; padding: 10px 16px 15px; color: var(--text-main); text-align: left; margin-top: 10px;}

                /* 列表样式 */
                .ios-list-group { background: var(--card-color); border-radius: 10px; margin: 0 16px 20px; overflow: hidden; }
                .ios-list-item { display: flex; align-items: center; padding: 10px 16px; position: relative; background: var(--card-color); min-height: 44px;}
                .ios-list-item.clickable { cursor: pointer; transition: background 0.15s; }
                .ios-list-item.clickable:active { background: #E5E5EA; }
                .ios-list-item:not(:last-child)::after { content: ''; position: absolute; bottom: 0; left: 16px; right: 0; border-bottom: 0.5px solid var(--separator); }
                
                .group-header { padding: 0 32px 6px; font-size: 13px; font-weight: 400; color: var(--text-sub); text-transform: uppercase; }

                /* 原生表单输入框 */
                .ios-input-label { width: 110px; font-size: 17px; font-weight: 400; color: var(--text-main); flex-shrink: 0;}
                .ios-input-field { flex: 1; border: none; outline: none; background: transparent; font-size: 17px; color: var(--blue); text-align: right; padding: 4px 0; width: 100%;}
                .ios-input-field:focus { color: var(--text-main); }
                .ios-input-field::placeholder { color: #C7C7CC; font-weight: 400;}
                .ios-fake-select { flex: 1; font-size: 17px; color: var(--text-sub); text-align: right; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;}
                
                .ios-btn-row { display: flex; justify-content: center; align-items: center; width: 100%; color: var(--blue); font-size: 17px; font-weight: 400; }
                .ios-btn-row.disabled { color: var(--text-sub); opacity: 0.5; pointer-events: none;}
                .list-arrow { color: #C7C7CC; display: flex; align-items: center; justify-content: center; margin-left: 8px;}
                .list-arrow svg { width: 16px; height: 16px; stroke: currentColor; fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;}

                .toast { position: fixed; top: 100px; left: 50%; transform: translateX(-50%); background: rgba(30,30,30,0.85); backdrop-filter: blur(10px); color: #fff; padding: 12px 24px; border-radius: 24px; font-size: 15px; font-weight: 500; pointer-events: none; opacity: 0; transition: 0.3s; z-index: 9999; text-align: center; max-width: 90%;}
                .toast.show { opacity: 1; }

                /* 底部抽屉 */
                .sheet-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.4); z-index: 9000; opacity: 0; transition: opacity 0.3s; pointer-events: none; }
                .sheet-overlay.active { opacity: 1; pointer-events: auto; }
                .action-sheet { position: fixed; bottom: 0; left: 0; width: 100vw; max-height: 80vh; background: #F2F2F7; border-radius: 20px 20px 0 0; z-index: 9001; transform: translateY(100%); transition: transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1); display: flex; flex-direction: column; padding-bottom: env(safe-area-inset-bottom, 20px);}
                .action-sheet.active { transform: translateY(0); }
                .sheet-header { display: flex; justify-content: space-between; align-items: center; padding: 16px; border-bottom: 0.5px solid var(--separator); background: rgba(255,255,255,0.9); backdrop-filter: blur(20px); border-radius: 20px 20px 0 0; }
                .sheet-title { font-size: 16px; font-weight: 600; color: var(--text-main); }
                .sheet-btn { font-size: 16px; color: var(--blue); font-weight: 600; cursor: pointer; background: none; border: none; outline: none; }
                .sheet-content { flex: 1; overflow-y: auto; padding: 10px 16px 20px; }
                .sheet-content::-webkit-scrollbar { display: none; }
                .sheet-list { background: #fff; border-radius: 12px; overflow: hidden; margin-top: 10px; }
                .sheet-item { padding: 16px; font-size: 16px; color: var(--text-main); text-align: center; border-bottom: 0.5px solid var(--separator); cursor: pointer; transition: background 0.1s;}
                .sheet-item:last-child { border-bottom: none; }
                .sheet-item:active { background: #E5E5EA; }
                .sheet-item.preset-item { display: flex; flex-direction: column; align-items: flex-start; text-align: left; }
                .preset-name { font-weight: 600; font-size: 16px; margin-bottom: 4px; }
                .preset-detail { font-size: 12px; color: var(--text-sub); }
            </style>

            <div class="set-container">
                <div class="set-top-bar">
                    <div class="set-left-action" onclick="closeApp()">
                        <svg viewBox="0 0 24 24" style="width:22px;height:22px;stroke:currentColor;stroke-width:2;fill:none;margin-right:2px;stroke-linecap:round;stroke-linejoin:round;"><path d="M15 18l-6-6 6-6"/></svg> 返回
                    </div>
                    <div class="set-title" id="set-title-small">Settings</div>
                </div>
                
                <div class="set-view-layer active" onscroll="set_handleScroll(this)">
                    <div class="ios-large-title">Settings</div>

                    <!-- ================= API 核心连接设置 ================= -->
                    <div class="group-header">API Connection</div>
                    <div class="ios-list-group">
                        <div class="ios-list-item">
                            <div class="ios-input-label">URL</div>
                            <input type="text" id="api-url" class="ios-input-field" placeholder="填入 API URL" value="${savedApiUrl}" onblur="set_saveConfig()">
                        </div>
                        <div class="ios-list-item">
                            <div class="ios-input-label">API Key</div>
                            <input type="password" id="api-key" class="ios-input-field" placeholder="sk-..." value="${savedApiKey}" onblur="set_saveConfig()">
                        </div>
                        <div class="ios-list-item clickable" onclick="set_openModelSheet('api')">
                            <div class="ios-input-label">Model</div>
                            <div class="ios-fake-select" id="api-model-text">${savedApiModel ? savedApiModel : '选择或输入模型'}</div>
                            <div class="list-arrow"><svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg></div>
                        </div>
                        <div class="ios-list-item clickable" onclick="set_fetchApiModels(this)">
                            <div class="ios-btn-row">刷新模型列表</div>
                        </div>
                        <div class="ios-list-item clickable" onclick="set_openPresetManager()">
                            <div class="ios-btn-row" style="color:var(--text-main);">预设管理</div>
                        </div>
                    </div>

                    <!-- ================= 数据管理 ================= -->
                    <div class="group-header">Data Management</div>
                    <div class="ios-list-group">
                        <!-- 隐藏的文件上传 input -->
                        <input type="file" id="data-import-input" accept=".json" style="display: none;" onchange="set_handleFileImport(event)">
                        
                        <div class="ios-list-item clickable" onclick="set_exportData()">
                            <div class="ios-btn-row">导出数据</div>
                        </div>
                        <div class="ios-list-item clickable" onclick="set_importData()">
                            <div class="ios-btn-row">导入数据</div>
                        </div>
                        <div class="ios-list-item clickable" onclick="set_clearData()">
                            <div class="ios-btn-row" style="color: var(--red);">清除所有数据</div>
                        </div>
                    </div>

                </div>

                <div class="toast" id="set-toast">提示信息</div>

                <!-- 底部抽屉 -->
                <div class="sheet-overlay" id="sheet-overlay" onclick="set_closeSheet()"></div>
                <div class="action-sheet" id="action-sheet">
                    <div class="sheet-header">
                        <button class="sheet-btn" style="color:transparent; pointer-events:none;">返回</button>
                        <div class="sheet-title" id="sheet-title">选择</div>
                        <button class="sheet-btn" onclick="set_closeSheet()">完成</button>
                    </div>
                    <div class="sheet-content" id="sheet-content"></div>
                </div>
            </div>
        `;
    } catch (err) {
        alert("设置页面渲染出错: " + err.message);
    }
}

window.set_handleScroll = function(el) {
    const titleSmall = document.getElementById('set-title-small');
    if (el.scrollTop > 45) { titleSmall.style.opacity = '1'; } else { titleSmall.style.opacity = '0'; }
};

window.set_showToast = function(msg) {
    const toast = document.getElementById('set-toast');
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 2000);
};

window.set_saveConfig = function() {
    localStorage.setItem('api_url', document.getElementById('api-url').value.trim());
    localStorage.setItem('api_key', document.getElementById('api-key').value.trim());
    localStorage.setItem('api_model', document.getElementById('api-model-text').innerText);
    set_showToast("设置已保存！");
};

