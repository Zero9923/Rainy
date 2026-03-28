window.onerror = function(msg) { console.error("Error: " + msg); };

window.ar_memory = []; window.ar_worlds = []; window.ar_active_id = null; window.ar_current_world_id = null;

window.ar_get = function() { try { var d = localStorage.getItem('ai_chars_safe'); return d ? JSON.parse(d) : []; } catch(e) { return window.ar_memory; } };
window.ar_set = function(d) { try { localStorage.setItem('ai_chars_safe', JSON.stringify(d)); } catch(e) { alert("Storage Full!"); } };
window.ar_get_worlds = function() { try { var d = localStorage.getItem('ar_worlds'); return d ? JSON.parse(d) : []; } catch(e) { return []; } };
window.ar_set_worlds = function(d) { localStorage.setItem('ar_worlds', JSON.stringify(d)); };

window.renderArchive = function() {
    var appLayer = document.getElementById('app-layer'); if (!appLayer) return;
    if (!localStorage.getItem('ai_chars_safe')) localStorage.setItem('ai_chars_safe', '[]');
    if (!localStorage.getItem('ar_worlds')) localStorage.setItem('ar_worlds', '[]');

    var htmlArr = [
        '<style>',
        '  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }',
        '  ::-webkit-scrollbar { display: none; }',
        '  body { margin:0; padding:0; background:#F2F2F7; overflow:hidden; }',
        '  .ar-app { width:100vw; height:100vh; display:flex; flex-direction:column; font-family:-apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif; color:#000; user-select:none; }',
        '  .ar-main { flex:1; overflow-y:auto; position:relative; padding-bottom:30px; }',
        '  .ar-bar { height:50px; display:flex; justify-content:space-between; align-items:center; padding:0 16px; background:rgba(255,255,255,0.85); backdrop-filter:blur(15px); -webkit-backdrop-filter:blur(15px); border-bottom:0.5px solid #E5E5EA; position:sticky; top:0; z-index:100; font-weight:600; font-size:17px; }',
        '  .ar-bar-btn { font-size:16px; font-weight:400; cursor:pointer; color:#007AFF; transition:opacity 0.2s;}',
        '  .ar-bar-btn:active { opacity:0.5; } .ar-bar-btn-black { color:#000; }',
        '  .ar-v, .ar-sub-v { display:none; } .ar-v.act { display:block; animation: fadeIn 0.3s ease; } .ar-sub-v.act { display:block; animation: slideIn 0.3s ease; }',
        '  @keyframes fadeIn { from {opacity:0;} to {opacity:1;} } @keyframes slideIn { from {transform:translateX(20px); opacity:0;} to {transform:translateX(0); opacity:1;} }',
        '  .ar-title { font-size:34px; font-weight:700; margin:16px 20px 10px; color:#000; letter-spacing:-0.5px;}',
        '  .ar-subtitle { font-size:13px; font-weight:400; margin:0 20px 20px; color:#8E8E93;}',
        '  .ar-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; padding:0 20px 20px; }',
        '  .ar-card { background:#FFF; border-radius:16px; cursor:pointer; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.04); border:0.5px solid rgba(0,0,0,0.05); transition:transform 0.2s; position:relative;}',
        '  .ar-card:active { transform:scale(0.95); opacity:0.9; }',
        '  .ar-pic-sq { width:100%; padding-top:100%; position:relative; background:#E5E5EA; } .ar-pic-sq img { position:absolute; top:0; left:0; width:100%; height:100%; object-fit:cover; }',
        '  .ar-name { padding:12px; text-align:center; font-size:15px; font-weight:600; color:#000; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;}',
        
        '  .folder-card { background:#FFF; color:#000; border-radius:16px; padding:20px; cursor:pointer; box-shadow:0 4px 12px rgba(0,0,0,0.05); display:flex; flex-direction:column; justify-content:center; align-items:center; aspect-ratio:1/1; position:relative; border:0.5px solid #E5E5EA; }',
        '  .folder-card:active { transform:scale(0.95); background:#F2F2F7; } .folder-icon { font-size:40px; margin-bottom:10px; } .folder-name { font-size:15px; font-weight:600; text-align:center; word-break:break-word; line-height:1.2;}',
        '  .role-badge { position:absolute; top:8px; left:8px; background:rgba(0,0,0,0.6); color:#FFF; font-size:10px; padding:2px 6px; border-radius:4px; backdrop-filter:blur(4px); font-weight:bold; z-index:5;}',
        
        '  .ar-tabbar { height:83px; background:rgba(255,255,255,0.9); backdrop-filter:blur(20px); border-top:0.5px solid #C6C6C8; display:flex; padding-bottom:env(safe-area-inset-bottom); z-index:100; }',
        '  .ar-tab { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; font-size:11px; font-weight:500; color:#8E8E93; cursor:pointer; padding-bottom:10px;}',
        '  .ar-tab-icon { width:24px; height:24px; margin-bottom:4px; border-radius:6px; border:2px solid #8E8E93; transition:0.3s;} .ar-tab.act { color:#000; } .ar-tab.act .ar-tab-icon { border-color:#000; background:#000; }',
        
        '  .ar-panel { position:fixed; top:0; left:0; width:100vw; height:100vh; background:#F2F2F7; z-index:999; transform:translateY(100%); transition:0.4s cubic-bezier(0.16, 1, 0.3, 1); display:flex; flex-direction:column; }',
        '  .ar-panel.act { transform:translateY(0); } .ar-p-content { flex:1; overflow-y:auto; padding-bottom:40px; }',
        
        '  .ar-avatar-wrap { width:110px; height:110px; border-radius:55px; background:#E5E5EA; margin:30px auto 20px; position:relative; overflow:hidden; box-shadow:0 4px 15px rgba(0,0,0,0.06); border:0.5px solid rgba(0,0,0,0.1); }',
        '  .ar-avatar-img { width:100%; height:100%; object-fit:cover; position:absolute; top:0; left:0; z-index:1; display:none; } .ar-avatar-ph { position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); font-size:45px; color:#8E8E93; font-weight:300; z-index:0; }',
        '  .ar-avatar-edit { position:absolute; bottom:0; left:0; width:100%; background:rgba(0,0,0,0.5); color:#FFF; font-size:10px; font-weight:700; text-align:center; padding:5px 0; z-index:2; backdrop-filter:blur(2px); }',
        '  .ar-avatar-wrap input[type="file"] { position:absolute; top:0; left:0; width:100%; height:100%; opacity:0; z-index:3; cursor:pointer; }',
        
        '  .ar-form-group { background:#FFF; border-radius:12px; margin:0 16px 24px; overflow:hidden; }',
        '  .ar-form-title { margin:24px 28px 8px; font-size:13px; color:#6D6D72; text-transform:uppercase; letter-spacing:0.5px; }',
        '  .ar-row { display:flex; align-items:center; padding:12px 16px; border-bottom:0.5px solid #E5E5EA; position:relative; min-height:44px;} .ar-row:last-child { border-bottom:none; }',
        '  .ar-row-col { flex-direction:column; align-items:flex-start; } .ar-label { font-size:16px; color:#000; width:90px; flex-shrink:0;}',
        '  .ar-input, .ar-select { flex:1; min-width:0; border:none; background:transparent; font-size:16px; font-family:inherit; color:#000; text-align:right; outline:none; padding-left:10px; }',
        '  .ar-input:focus { text-align:left; } .ar-input::placeholder, .ar-area::placeholder { color:#C7C7CC; }',
        '  .ar-area { width:100%; height:80px; border:none; background:transparent; font-size:16px; font-family:inherit; color:#000; resize:none; outline:none; padding:0; margin-top:5px;}',
        
        '  .ar-upload-row { cursor:pointer; transition:background 0.2s; } .ar-upload-row:active { background:#F2F2F7; } .ar-upload-row input[type="file"] { position:absolute; top:0; left:0; width:100%; height:100%; opacity:0; }',
        '  .ar-pre-img { width:32px; height:32px; border-radius:4px; object-fit:cover; display:none; margin-left:10px; border:0.5px solid #E5E5EA; }',
        '  .ar-btn-danger { color:#FF3B30; text-align:center; width:100%; font-weight:600; font-size:16px; cursor:pointer; }',
        '  .ar-btn-black { background:#000; color:#FFF; margin:0 16px; border-radius:12px; padding:16px; text-align:center; font-weight:600; font-size:16px; cursor:pointer; transition:0.2s;} .ar-btn-black:active { transform:scale(0.97); }',
        '  .ar-toast { position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:rgba(0,0,0,0.8); color:#FFF; font-size:15px; font-weight:500; padding:12px 24px; border-radius:10px; z-index:9999; display:none; backdrop-filter:blur(10px); pointer-events:none;}',
        
        '  .as-overlay { position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.4); z-index:10000; opacity:0; pointer-events:none; transition:opacity 0.3s; display:flex; flex-direction:column; justify-content:flex-end; padding-bottom:20px; }',
        '  .as-overlay.act { opacity:1; pointer-events:auto; } .as-box { margin:0 16px; transform:translateY(120%); transition:transform 0.3s cubic-bezier(0.16,1,0.3,1); } .as-overlay.act .as-box { transform:translateY(0); }',
        '  .as-group { background:rgba(255,255,255,0.9); backdrop-filter:blur(20px); border-radius:14px; margin-bottom:8px; overflow:hidden; }',
        '  .as-btn { padding:18px; text-align:center; font-size:20px; color:#007AFF; font-weight:400; border-bottom:0.5px solid rgba(0,0,0,0.1); cursor:pointer;} .as-cancel { font-weight:600; }',
        '  .w-list { padding:0 20px 20px; } .w-item { background:#FFF; border-radius:16px; padding:20px; margin-bottom:16px; box-shadow:0 4px 12px rgba(0,0,0,0.04); display:flex; justify-content:space-between; align-items:center; cursor:pointer;} .w-item:active { transform:scale(0.98); } .w-item-name { font-size:20px; font-weight:700; color:#000; margin-bottom:4px;} .w-item-desc { font-size:13px; color:#8E8E93; text-overflow:ellipsis; overflow:hidden; white-space:nowrap; max-width:200px;}',
        
        '  .canvas-wrap { flex:1; width:100%; position:relative; background:#E5E5EA; overflow:hidden; touch-action:none; }',
        '  .canvas-bg { position:absolute; width:10000px; height:10000px; left:-5000px; top:-5000px; background-image: radial-gradient(#C7C7CC 1px, transparent 1px); background-size: 20px 20px; pointer-events:none; }',
        '  .canvas-plane { position:absolute; left:50%; top:50%; width:0; height:0; }',
        '  .canvas-svg { position:absolute; overflow:visible; pointer-events:none; z-index:1; }',
        '  .c-edge-line { stroke:#000; stroke-width:2px; stroke-dasharray:4; } .c-edge-text { paint-order:stroke; stroke:#E5E5EA; stroke-width:6px; stroke-linecap:round; stroke-linejoin:round; fill:#007AFF; font-size:14px; font-weight:bold; cursor:pointer; pointer-events:auto;}',
        
        '  .c-node { position:absolute; transform:translate(-50%, -50%); width:60px; height:60px; border-radius:50%; background:#FFF; box-shadow:0 4px 10px rgba(0,0,0,0.2); z-index:10; display:flex; align-items:center; justify-content:center; flex-direction:column; border:3px solid transparent; transition:box-shadow 0.2s;}',
        '  .c-node.sel { border-color:#007AFF; box-shadow:0 0 0 4px rgba(0,122,255,0.3); } .c-node-img { width:100%; height:100%; border-radius:50%; object-fit:cover; position:absolute; z-index:1; pointer-events:none;}',
        '  .c-node-label { position:absolute; bottom:-25px; background:rgba(255,255,255,0.8); padding:2px 6px; border-radius:4px; font-size:12px; font-weight:600; white-space:nowrap; z-index:2; box-shadow:0 2px 4px rgba(0,0,0,0.1); pointer-events:none;}',
        '  .c-node-main { border-color:#000; width:74px; height:74px; }',
        
        '  .c-tip { position:absolute; top:20px; left:50%; transform:translateX(-50%); background:rgba(0,0,0,0.6); color:#FFF; font-size:13px; padding:8px 16px; border-radius:20px; pointer-events:none; z-index:100; font-weight:500; backdrop-filter:blur(5px); text-align:center; transition:0.3s;}',
        '  .cv-action-btn { position:absolute; bottom:50px; left:50%; transform:translateX(-50%); z-index:9999; padding:16px 30px; border-radius:30px; font-weight:700; font-size:16px; color:#FFF; background:#000; box-shadow:0 10px 20px rgba(0,0,0,0.2); cursor:pointer; display:none; white-space:nowrap; transition:background 0.2s, transform 0.1s;}',
        '  .cv-action-btn:active { transform:translateX(-50%) scale(0.95); }',
        
        '  .modal-center { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%) scale(0.9); background:#FFF; border-radius:14px; width:80%; max-width:320px; padding:20px; box-shadow:0 10px 40px rgba(0,0,0,0.2); z-index:10001; opacity:0; pointer-events:none; transition:0.3s cubic-bezier(0.16,1,0.3,1); }',
        '  .as-overlay.act .modal-center { transform:translate(-50%,-50%) scale(1); opacity:1; pointer-events:auto; }',
        '</style>',

        '<div class="ar-app">',
        '  <div class="ar-main">',
        '    <div id="ar-v-w" class="ar-v act"><div class="ar-bar"><div class="ar-bar-btn ar-bar-btn-black" onclick="closeApp()">Exit</div><div>Universes</div><div class="ar-bar-btn ar-bar-btn-black" onclick="world_edit(\'\')" style="font-size:24px;">+</div></div><div class="ar-title">Worlds</div><div class="ar-subtitle">Long press any world to delete it entirely.</div><div class="w-list" id="w-list"></div></div>',

        '    <div id="ar-v-c" class="ar-v">',
        '      <div id="ar-c-root" class="ar-sub-v act"><div class="ar-bar"><div class="ar-bar-btn ar-bar-btn-black" onclick="closeApp()">Exit</div><div>Archives</div><div style="width:30px;"></div></div><div class="ar-title">Databases</div><div class="ar-subtitle">Select or long press a World.</div><div class="ar-grid" id="c-folder-grid"></div></div>',
        '      <div id="ar-c-sub" class="ar-sub-v"><div class="ar-bar"><div class="ar-bar-btn" onclick="back_to(\'c-root\')">< Back</div><div id="c-sub-title" style="max-width:150px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">Characters</div><div class="ar-bar-btn ar-bar-btn-black" onclick="char_edit(\'\')" style="font-size:24px;">+</div></div><div class="ar-title" style="font-size:24px;" id="c-sub-h1">Characters</div><div class="ar-subtitle">Main Characters are pinned to the top.</div><div class="ar-grid" id="c-char-grid"></div></div>',
        '    </div>',
        
        '    <div id="ar-v-n" class="ar-v">',
        '      <div id="ar-n-root" class="ar-sub-v act"><div class="ar-bar"><div class="ar-bar-btn ar-bar-btn-black" onclick="closeApp()">Exit</div><div>Networks</div><div style="width:30px;"></div></div><div class="ar-title">Graphs</div><div class="ar-subtitle">Select or long press a World.</div><div class="ar-grid" id="n-folder-grid"></div></div>',
        '      <div id="ar-n-sub" class="ar-sub-v"><div class="ar-bar"><div class="ar-bar-btn" onclick="back_to(\'n-root\')">< Back</div><div id="n-sub-title" style="max-width:150px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">Networks</div><div style="width:30px;"></div></div><div class="ar-title" style="font-size:24px;">Main Characters</div><div class="ar-subtitle">Long press to View/Edit or Clear map.</div><div class="ar-grid" id="n-main-grid"></div></div>',
        '    </div>',
        '  </div>',

        '  <div class="ar-tabbar"><div class="ar-tab act" onclick="ar_tab(\'w\', this)"><div class="ar-tab-icon" style="border-radius:12px; border-style:dotted;"></div><div>Worlds</div></div><div class="ar-tab" onclick="ar_tab(\'c\', this)"><div class="ar-tab-icon"></div><div>Profiles</div></div><div class="ar-tab" onclick="ar_tab(\'n\', this)"><div class="ar-tab-icon" style="border-radius:12px;"></div><div>Network</div></div></div>',

        '  <div id="world-panel" class="ar-panel"><div class="ar-bar"><div class="ar-bar-btn" onclick="document.getElementById(\'world-panel\').classList.remove(\'act\')">Cancel</div><div>Edit World</div><div class="ar-bar-btn" onclick="world_save()" style="font-weight:600;">Save</div></div><div class="ar-p-content"><input type="hidden" id="w-id"><div class="ar-form-title">Basic Info</div><div class="ar-form-group"><div class="ar-row"><div class="ar-label">Name</div><input id="w-name" class="ar-input" placeholder="Required"></div></div><div class="ar-form-title">World Setting</div><div class="ar-form-group"><div class="ar-row ar-row-col"><textarea id="w-setting" class="ar-area" style="height:120px;" placeholder="Describe the world..."></textarea></div></div><div class="ar-form-title">Framework</div><div class="ar-form-group"><div class="ar-row ar-row-col"><textarea id="w-frame" class="ar-area" style="height:120px;" placeholder="Rules, magic systems..."></textarea></div></div><div class="ar-form-group" id="btn-w-del-wrap" style="margin-top:30px;"><div class="ar-row"><div class="ar-btn-danger" onclick="world_del()">Delete World</div></div></div></div></div>',

        '  <div id="ar-panel" class="ar-panel"><div class="ar-bar"><div class="ar-bar-btn" onclick="document.getElementById(\'ar-panel\').classList.remove(\'act\')">Cancel</div><div>Edit Profile</div><div class="ar-bar-btn" onclick="char_save()" style="font-weight:600;">Save</div></div><div class="ar-p-content"><input type="hidden" id="c-id"><div class="ar-avatar-wrap"><img id="p-av" class="ar-avatar-img"><div id="p-av-ph" class="ar-avatar-ph">+</div><div class="ar-avatar-edit">EDIT</div><input type="hidden" id="c-avatar"><input type="file" accept="image/*" onchange="ar_comp(this, \'c-avatar\', \'p-av\', \'l-1\', true)"></div><div class="ar-form-title">Role in World</div><div class="ar-form-group"><div class="ar-row"><div class="ar-label">Role</div><select id="c-role" class="ar-select"><option value="main">Main Character (主角)</option><option value="npc">NPC (配角)</option></select></div></div><div class="ar-form-title">Identity</div><div class="ar-form-group"><div class="ar-row"><div class="ar-label">Name</div><input id="c-name" class="ar-input" placeholder="Required"></div><div class="ar-row"><div class="ar-label">Phone</div><input id="c-phn" class="ar-input" placeholder="Optional" type="tel"></div></div><div class="ar-form-title">Social Profile</div><div class="ar-form-group"><div class="ar-row"><div class="ar-label">WeChat ID</div><input id="c-wxi" class="ar-input" placeholder="Optional"></div><div class="ar-row"><div class="ar-label">Region</div><input id="c-reg" class="ar-input" placeholder="Optional"></div><div class="ar-row"><div class="ar-label">Signature</div><input id="c-sig" class="ar-input" placeholder="Optional"></div><div class="ar-row ar-upload-row"><div class="ar-label">Cover</div><div style="flex:1; text-align:right; color:#8E8E93;">Upload ></div><input type="hidden" id="c-cov"><input type="file" accept="image/*" onchange="ar_comp(this, \'c-cov\', \'p-cov\', \'l-2\', false)"><img id="p-cov" class="ar-pre-img"></div></div><div class="ar-form-title">Persona</div><div class="ar-form-group"><div class="ar-row ar-row-col"><textarea id="c-per" class="ar-area" placeholder="Enter background setting..."></textarea></div></div><div class="ar-form-group" id="btn-del-wrap" style="margin-top:30px;"><div class="ar-row"><div class="ar-btn-danger" onclick="char_del()">Delete Character</div></div></div></div></div>',

        '  <div id="canvas-panel" class="ar-panel" style="background:#E5E5EA;"><div class="ar-bar" style="background:rgba(255,255,255,0.9);"><div class="ar-bar-btn" onclick="canvas_close()">Cancel</div><div id="cv-title" style="font-weight:700;">Map</div><div class="ar-bar-btn" onclick="canvas_save()" style="font-weight:600;">Save</div></div><div class="canvas-wrap" id="cv-wrap"><div class="canvas-bg"></div><div class="c-tip" id="cv-tip">Drag to Pan. Pinch to Zoom.</div><div class="canvas-plane" id="cv-plane"><svg class="canvas-svg" id="cv-svg"></svg><div id="cv-nodes"></div></div></div><div id="cv-action-btn" class="cv-action-btn" onclick="handle_cv_action(event)" ontouchend="handle_cv_action(event)">+ Add Character</div></div>',

        '  <div id="ar-action-sheet" class="as-overlay" onclick="close_as(event)"><div class="as-box" id="as-box-inner"><div class="as-group"><div class="as-btn" onclick="trigger_as_view()">View Canvas Map</div><div class="as-btn" onclick="trigger_as_edit()">Edit Connections</div><div class="as-btn" style="color:#FF3B30;" onclick="trigger_as_clear()">Clear Network</div></div><div class="as-group"><div class="as-btn as-cancel">Cancel</div></div></div></div>',
        
        '  <div id="modal-pick-npc" class="as-overlay" onclick="document.getElementById(\'modal-pick-npc\').classList.remove(\'act\')"><div class="modal-center" onclick="event.stopPropagation()"><div style="font-weight:700; font-size:18px; margin-bottom:15px; text-align:center;">Select NPC</div><div id="pick-npc-list" style="max-height:300px; overflow-y:auto;"></div><div class="ar-btn-black" onclick="document.getElementById(\'modal-pick-npc\').classList.remove(\'act\')" style="margin:20px 0 0 0; padding:12px;">Cancel</div></div></div>',
        '  <div id="modal-link" class="as-overlay" onclick="document.getElementById(\'modal-link\').classList.remove(\'act\')"><div class="modal-center" onclick="event.stopPropagation()"><div style="font-weight:700; font-size:18px; margin-bottom:10px; text-align:center;">Define Relation</div><div id="link-names" style="font-size:14px; color:#8E8E93; text-align:center; margin-bottom:20px; font-weight:600;">A -> B</div><input id="link-label" class="ar-input" style="background:#F2F2F7; padding:12px; border-radius:8px; text-align:center; width:100%; margin-bottom:15px;" placeholder="e.g. Enemy, Friend"><div class="ar-btn-black" onclick="submit_link()" style="margin:0; padding:12px;">Draw Link</div></div></div>',

        '  <div id="node-info-modal" class="as-overlay" onclick="document.getElementById(\'node-info-modal\').classList.remove(\'act\')" style="justify-content:center;"><div class="modal-center" onclick="event.stopPropagation()" style="text-align:center;"><img id="nim-av" style="width:80px;height:80px;border-radius:40px;object-fit:cover;margin:0 auto 10px;box-shadow:0 4px 10px rgba(0,0,0,0.1);"><div id="nim-name" style="font-size:22px;font-weight:700;margin-bottom:5px;"></div><div id="nim-role" style="font-size:12px;color:#007AFF;margin-bottom:15px;font-weight:600;"></div><div id="nim-per" style="font-size:14px;color:#333;background:#F2F2F7;padding:12px;border-radius:8px;max-height:180px;overflow-y:auto;text-align:left;margin-bottom:20px;line-height:1.5;"></div><div style="display:flex;gap:10px;"><div id="nim-btn-link" class="ar-btn-black" style="flex:1;margin:0;padding:12px;" onclick="start_link_from_modal()">🔗 Link</div><div class="ar-btn-black" style="flex:1;margin:0;padding:12px;background:#E5E5EA;color:#000;" onclick="document.getElementById(\'node-info-modal\').classList.remove(\'act\')">Close</div></div></div></div>',

        '  <div id="ar-toast" class="ar-toast">Saved</div>',
        '</div>'
    ];
    appLayer.innerHTML = htmlArr.join('');
    setTimeout(function() { window.ar_tab('w', document.querySelectorAll('.ar-tab')[0]); window.init_canvas_events(); }, 50);
};

window.ar_tab = function(v, el) {
    document.querySelectorAll('.ar-tab').forEach(function(t){t.classList.remove('act')});
    document.querySelectorAll('.ar-v').forEach(function(t){t.classList.remove('act')});
    el.classList.add('act'); document.getElementById('ar-v-' + v).classList.add('act');
    if(v === 'w') window.render_worlds(); if(v === 'c') window.back_to('c-root'); if(v === 'n') window.back_to('n-root');
};
window.back_to = function(target) {
    document.querySelectorAll('.ar-sub-v').forEach(function(t){t.classList.remove('act')}); document.getElementById('ar-'+target).classList.add('act');
    if(target === 'c-root' || target === 'n-root') window.render_folders(target.charAt(0));
};
window.ar_toast = function(m) { var t = document.getElementById('ar-toast'); if(!t) return; t.innerText = m; t.style.display = 'block'; setTimeout(function(){ t.style.display = 'none'; }, 1500); };
window.closeApp = function() { if(confirm("Exit App?")) document.getElementById('app-layer').innerHTML = ''; };
window.ar_close = function() { document.getElementById('ar-panel').classList.remove('act'); };

window.ar_comp = function(input, targetId, imgId, loadId, isAvatar) {
    var file = input.files[0]; if (!file) return; var reader = new FileReader();
    reader.onload = function(e) {
        var img = new Image(); img.onload = function() {
            var canvas = document.createElement('canvas'); var ctx = canvas.getContext('2d'); var MAX = 300; var w = img.width; var h = img.height;
            if (w > h) { if (w > MAX) { h *= MAX / w; w = MAX; } } else { if (h > MAX) { w *= MAX / h; h = MAX; } }
            canvas.width = w; canvas.height = h; 
            ctx.fillStyle = "#FFFFFF"; ctx.fillRect(0, 0, w, h); 
            ctx.drawImage(img, 0, 0, w, h);
            var dataUrl = canvas.toDataURL('image/jpeg', 0.8); document.getElementById(targetId).value = dataUrl;
            var pImg = document.getElementById(imgId); if(pImg) { pImg.src = dataUrl; pImg.style.display = 'block'; }
            if (isAvatar) { var ph = document.getElementById('p-av-ph'); if (ph) ph.style.display = 'none'; }
        }; img.src = e.target.result;
    }; reader.readAsDataURL(file);
};

window.wLpTimer = null; window.isWLp = false;
window.wLpDown = function(id) {
    window.isWLp = false;
    window.wLpTimer = setTimeout(function() {
        window.isWLp = true;
        if(confirm("Delete World and ALL its Characters?")) {
            var ws = window.ar_get_worlds();
            window.ar_set_worlds(ws.filter(function(w){return w.id !== id;}));
            var chars = window.ar_get();
            window.ar_set(chars.filter(function(c){return c.worldId !== id;}));
            window.ar_toast('World Deleted');
            window.render_worlds();
            if(document.getElementById('ar-v-c').classList.contains('act')) window.back_to('c-root');
            if(document.getElementById('ar-v-n').classList.contains('act')) window.back_to('n-root');
        }
    }, 600);
};
window.wLpUp = function() { if(window.wLpTimer) clearTimeout(window.wLpTimer); };
window.wClick = function(id) { if(window.isWLp) return; window.world_edit(id); };
window.wFolderClick = function(id, name, prefix) { if(window.isWLp) return; window.open_world_chars(id, name, prefix); };

window.world_edit = function(id) {
    var ws = window.ar_get_worlds(); var w = null; for(var i=0; i<ws.length; i++) { if(ws[i].id === id) w = ws[i]; }
    document.getElementById('w-id').value = id || ''; document.getElementById('w-name').value = w ? (w.name||'') : '';
    document.getElementById('w-setting').value = w ? (w.setting||'') : ''; document.getElementById('w-frame').value = w ? (w.frame||'') : '';
    document.getElementById('btn-w-del-wrap').style.display = id ? 'block' : 'none'; document.getElementById('world-panel').classList.add('act');
};
window.world_save = function() {
    var id = document.getElementById('w-id').value; var name = document.getElementById('w-name').value.trim(); if(!name) return window.ar_toast('Name required');
    var ws = window.ar_get_worlds(); var obj = { name: name, setting: document.getElementById('w-setting').value.trim(), frame: document.getElementById('w-frame').value.trim() };
    if(id) { for(var i=0; i<ws.length; i++) { if(ws[i].id === id) { obj.id = id; ws[i] = obj; break; } } } else { obj.id = 'W_' + new Date().getTime(); ws.push(obj); }
    window.ar_set_worlds(ws); document.getElementById('world-panel').classList.remove('act'); window.render_worlds(); window.ar_toast('Saved');
};
window.world_del = function() {
    var id = document.getElementById('w-id').value; 
    if(confirm("Delete World and ALL its Characters?")) {
        var ws = window.ar_get_worlds(); 
        window.ar_set_worlds(ws.filter(function(w){return w.id !== id;}));
        var chars = window.ar_get();
        window.ar_set(chars.filter(function(c){return c.worldId !== id;}));
        document.getElementById('world-panel').classList.remove('act'); 
        window.render_worlds(); window.ar_toast('Deleted');
        if(document.getElementById('ar-v-c').classList.contains('act')) window.back_to('c-root');
        if(document.getElementById('ar-v-n').classList.contains('act')) window.back_to('n-root');
    }
};
window.render_worlds = function() {
    var ws = window.ar_get_worlds(); var list = document.getElementById('w-list'); list.innerHTML = '';
    if(ws.length===0) return list.innerHTML = '<div style="text-align:center; color:#8E8E93; padding:40px 20px;">No worlds created.</div>';
    for(var i=0; i<ws.length; i++) { list.innerHTML += '<div class="w-item" onmousedown="wLpDown(\''+ws[i].id+'\')" onmouseup="wLpUp()" onmouseleave="wLpUp()" ontouchstart="wLpDown(\''+ws[i].id+'\')" ontouchend="wLpUp()" onclick="wClick(\''+ws[i].id+'\')"><div><div class="w-item-name">'+ws[i].name+'</div><div class="w-item-desc">'+(ws[i].setting||'No details.')+'</div></div><div style="color:#C7C7CC; font-size:20px; font-weight:700;">></div></div>'; }
};

window.render_folders = function(tabPrefix) {
    var ws = window.ar_get_worlds(); var grid = document.getElementById(tabPrefix + '-folder-grid'); grid.innerHTML = '';
    if(ws.length===0) return grid.innerHTML = '<div style="grid-column:1/3;text-align:center;color:#8E8E93;padding:40px 0;">Create a World first.</div>';
    for(var i=0; i<ws.length; i++) { grid.innerHTML += '<div class="folder-card" onmousedown="wLpDown(\''+ws[i].id+'\')" onmouseup="wLpUp()" onmouseleave="wLpUp()" ontouchstart="wLpDown(\''+ws[i].id+'\')" ontouchend="wLpUp()" onclick="wFolderClick(\''+ws[i].id+'\', \''+ws[i].name+'\', \''+tabPrefix+'\')"><div class="folder-icon">📁</div><div class="folder-name">'+ws[i].name+'</div></div>'; }
};
window.open_world_chars = function(wId, wName, tabPrefix) {
    window.ar_current_world_id = wId; document.getElementById(tabPrefix + '-sub-title').innerText = wName;
    if(tabPrefix==='c') document.getElementById('c-sub-h1').innerText = wName;
    document.querySelectorAll('.ar-sub-v').forEach(function(t){t.classList.remove('act')}); document.getElementById('ar-'+tabPrefix+'-sub').classList.add('act');
    var chars = window.ar_get(); var grid = document.getElementById(tabPrefix==='c' ? 'c-char-grid' : 'n-main-grid'); grid.innerHTML = '';
    var wChars = chars.filter(function(c){ return c.worldId === wId; });
    if(tabPrefix === 'n') { wChars = wChars.filter(function(c){ return c.role === 'main'; }); } else { wChars.sort(function(a, b) { if(a.role === 'main' && b.role !== 'main') return -1; if(a.role !== 'main' && b.role === 'main') return 1; return 0; }); }
    if(wChars.length===0) { grid.innerHTML = '<div style="grid-column:1/3;text-align:center;color:#8E8E93;padding:40px 0;">No Characters here.</div>'; return; }
    var html = '';
    for(var i=0; i<wChars.length; i++) {
        var c = wChars[i]; var img = c.avatar || ''; var cId = c.id || ''; var cName = c.name || 'Unknown';
        var roleTag = c.role === 'main' ? '<div class="role-badge" style="background:#007AFF;">MAIN</div>' : '<div class="role-badge">NPC</div>';
        var clickType = tabPrefix === 'c' ? 'c' : 'n';
        html += '<div class="ar-card" onmousedown="lpDown(\''+cId+'\', \''+clickType+'\')" onmouseup="lpUp()" onmouseleave="lpUp()" ontouchstart="lpDown(\''+cId+'\', \''+clickType+'\')" ontouchend="lpUp()" onclick="cardClick(\''+cId+'\', \''+clickType+'\')"><div class="ar-pic-sq">'+roleTag+'<img src="'+img+'" onerror="this.style.display=\'none\'"></div><div class="ar-name">'+cName+'</div></div>';
    }
    grid.innerHTML = html;
};

window.char_edit = function(id) {
    var chars = window.ar_get(); var c = null; for(var i=0; i<chars.length; i++) { if(chars[i].id === id) c = chars[i]; }
    document.getElementById('c-id').value = id || '';
    document.getElementById('c-name').value = c ? (c.name||'') : ''; document.getElementById('c-avatar').value = c ? (c.avatar||'') : '';
    document.getElementById('c-role').value = c ? (c.role||'main') : 'main'; document.getElementById('c-phn').value = c ? (c.phone||'') : '';
    document.getElementById('c-wxi').value = c ? (c.wcId||'') : ''; document.getElementById('c-reg').value = c ? (c.region||'') : '';
    document.getElementById('c-sig').value = c ? (c.signature||'') : ''; document.getElementById('c-cov').value = c ? (c.cover||'') : '';
    document.getElementById('c-per').value = c ? (c.persona||'') : '';
    var iAv = document.getElementById('p-av'); var ph = document.getElementById('p-av-ph'); var iCov = document.getElementById('p-cov');
    if(c && c.avatar) { iAv.style.display = 'block'; iAv.src = c.avatar; if(ph) ph.style.display = 'none'; } else { iAv.style.display = 'none'; if(ph) ph.style.display = 'block'; }
    if(c && c.cover) { iCov.style.display = 'block'; iCov.src = c.cover; } else { iCov.style.display = 'none'; }
    document.getElementById('btn-del-wrap').style.display = id ? 'block' : 'none'; document.getElementById('ar-panel').classList.add('act');
};
window.char_save = function() {
    var id = document.getElementById('c-id').value; var name = document.getElementById('c-name').value.trim(); if(!name) return window.ar_toast('Name required');
    var chars = window.ar_get();
    var obj = { name: name, avatar: document.getElementById('c-avatar').value, role: document.getElementById('c-role').value, worldId: window.ar_current_world_id, phone: document.getElementById('c-phn').value.trim(), wcId: document.getElementById('c-wxi').value.trim(), region: document.getElementById('c-reg').value.trim(), signature: document.getElementById('c-sig').value.trim(), cover: document.getElementById('c-cov').value, persona: document.getElementById('c-per').value.trim() };
    if(id) { for(var i=0; i<chars.length; i++) { if(chars[i].id === id) { obj.id = id; obj.cvNodes = chars[i].cvNodes||[]; obj.cvEdges = chars[i].cvEdges||[]; chars[i] = obj; break; } } } else { obj.id = 'C_' + new Date().getTime(); obj.cvNodes = []; obj.cvEdges = []; chars.push(obj); }
    window.ar_set(chars); document.getElementById('ar-panel').classList.remove('act'); window.ar_toast('Saved');
    window.open_world_chars(window.ar_current_world_id, document.getElementById('c-sub-title').innerText, 'c');
};
window.char_del = function(passedId) {
    var id = passedId || document.getElementById('c-id').value;
    var chars = window.ar_get(); var newChars = []; for(var i=0; i<chars.length; i++) { if(chars[i].id !== id) newChars.push(chars[i]); }
    window.ar_set(newChars); document.getElementById('ar-panel').classList.remove('act'); window.ar_toast('Deleted');
    window.open_world_chars(window.ar_current_world_id, document.getElementById('c-sub-title').innerText, 'c');
};

window.lpTimer = null; window.isLp = false;
window.lpDown = function(id, type) { 
    window.isLp = false; 
    window.lpTimer = setTimeout(function() { 
        window.isLp = true; 
        if(type === 'c') { if(confirm("Delete Character?")) window.char_del(id); } 
        else if(type === 'n') { window.open_as(id); } 
    }, 600); 
};
window.lpUp = function() { if(window.lpTimer) clearTimeout(window.lpTimer); };
window.cardClick = function(id, type) { 
    if(window.isLp) return; 
    if(type === 'c') window.char_edit(id); 
    if(type === 'n') window.ar_toast('Long press to View/Edit map'); 
};

window.open_as = function(id) { window.ar_active_id = id; document.getElementById('ar-action-sheet').classList.add('act'); };
window.close_as = function(e) { if(e && e.target.id === 'as-box-inner') return; document.getElementById('ar-action-sheet').classList.remove('act'); };
window.trigger_as_view = function() { window.close_as(); if(window.ar_active_id) window.canvas_open(window.ar_active_id, false); };
window.trigger_as_edit = function() { window.close_as(); if(window.ar_active_id) window.canvas_open(window.ar_active_id, true); };
window.trigger_as_clear = function() { 
    window.close_as(); 
    if(!window.ar_active_id) return;
    if(confirm("Clear this character's network map?")) {
        var chars = window.ar_get();
        for(var i=0; i<chars.length; i++) { if(chars[i].id === window.ar_active_id) { chars[i].cvNodes = []; chars[i].cvEdges = []; break; } }
        window.ar_set(chars); window.ar_toast('Network Cleared');
    }
};

window.cv = { isEdit: false, mainId: null, worldId: null, panX: 0, panY: 0, scale: 1, isDragging: false, isPinching: false, startX: 0, startY: 0, startDist: 0, startScale: 1, draggingNodeId: null, nodeMoved: false, nodes: [], edges: [], selNodeId: null, tmpSource: null, tmpTarget: null };

window.canvas_close = function() { document.getElementById('canvas-panel').classList.remove('act'); document.getElementById('cv-action-btn').style.display = 'none'; };

window.update_cv_ui = function() {
    var tip = document.getElementById('cv-tip'); var btn = document.getElementById('cv-action-btn');
    if(!window.cv.isEdit) { tip.style.display = 'none'; btn.style.display = 'none'; return; }
    tip.style.display = 'block'; btn.style.display = 'block';
    if(window.cv.selNodeId) {
        tip.innerHTML = "Tap another character to Link.<br><span style='font-size:10px;color:#ccc;'>Or tap empty space to cancel.</span>";
        btn.innerText = "Cancel Link Mode"; btn.style.background = "#FF3B30";
    } else {
        tip.innerHTML = "Tap: View Profile | Dbl-Tap: Delete";
        btn.innerText = "+ Add Character"; btn.style.background = "#000";
    }
};

window.cv_action_locked = false;
window.handle_cv_action = function(e) {
    if(e) { e.stopPropagation(); e.preventDefault(); }
    if(window.cv_action_locked) return; window.cv_action_locked = true; setTimeout(function(){ window.cv_action_locked = false; }, 300);
    if(window.cv.selNodeId) { window.cv.selNodeId = null; window.update_cv_ui(); window.canvas_draw(); } 
    else { window.force_add_node(); }
};

window.canvas_open = function(mainId, isEdit) {
    window.cv.mainId = mainId; window.cv.isEdit = isEdit;
    var chars = window.ar_get(); var mainChar = null; for(var i=0; i<chars.length; i++) { if(chars[i].id === mainId) mainChar = chars[i]; }
    if(!mainChar) return;
    window.cv.worldId = mainChar.worldId; document.getElementById('cv-title').innerText = mainChar.name + (isEdit ? ' (Edit)' : ' (View)');
    window.cv.nodes = mainChar.cvNodes ? JSON.parse(JSON.stringify(mainChar.cvNodes)) : [];
    window.cv.edges = mainChar.cvEdges ? JSON.parse(JSON.stringify(mainChar.cvEdges)) : [];
    window.cv.selNodeId = null; window.cv.panX = 0; window.cv.panY = 0; window.cv.scale = 1;
    if(window.cv.nodes.length === 0) { window.cv.nodes.push({ id: 'N_'+new Date().getTime(), charId: mainId, x: 0, y: 0 }); }
    document.getElementById('canvas-panel').classList.add('act'); window.update_cv_ui(); window.canvas_draw();
};

window.canvas_save = function() {
    if(!window.cv.isEdit) return window.canvas_close(); 
    var chars = window.ar_get(); for(var i=0; i<chars.length; i++) { if(chars[i].id === window.cv.mainId) { chars[i].cvNodes = window.cv.nodes; chars[i].cvEdges = window.cv.edges; break; } }
    window.ar_set(chars); window.ar_toast('Map Saved!'); window.canvas_close();
};

window.canvas_draw_lines = function() {
    var svg = document.getElementById('cv-svg'); var svgHTML = '';
    for(var i=0; i<window.cv.edges.length; i++) {
        var e = window.cv.edges[i];
        var n1 = window.cv.nodes.find(function(n){return n.id === e.source}); var n2 = window.cv.nodes.find(function(n){return n.id === e.target});
        if(n1 && n2) {
            svgHTML += '<line x1="'+n1.x+'" y1="'+n1.y+'" x2="'+n2.x+'" y2="'+n2.y+'" class="c-edge-line"/>';
            var mx = (n1.x + n2.x)/2; var my = (n1.y + n2.y)/2;
            svgHTML += '<text x="'+mx+'" y="'+(my+5)+'" text-anchor="middle" class="c-edge-text" onclick="delete_edge(event, \''+e.id+'\')">'+e.label+'</text>';
        }
    }
    svg.innerHTML = svgHTML;
};

window.canvas_draw_nodes = function() {
    var chars = window.ar_get(); var nodesWrap = document.getElementById('cv-nodes'); var nodesHTML = '';
    for(var j=0; j<window.cv.nodes.length; j++) {
        var nd = window.cv.nodes[j]; var charObj = chars.find(function(c){return c.id === nd.charId});
        var name = charObj ? charObj.name : '?'; var img = charObj ? charObj.avatar : '';
        var isMain = charObj && charObj.role === 'main' ? 'c-node-main' : '';
        var isSel = window.cv.selNodeId === nd.id ? 'sel' : '';
        nodesHTML += '<div id="dom_'+nd.id+'" data-nid="'+nd.id+'" class="c-node '+isMain+' '+isSel+'" style="left:'+nd.x+'px; top:'+nd.y+'px;"><img class="c-node-img" src="'+img+'" onerror="this.style.display=\'none\'"><div class="c-node-label">'+name+'</div></div>';
    }
    nodesWrap.innerHTML = nodesHTML;
};

window.canvas_draw = function() {
    var plane = document.getElementById('cv-plane'); 
    plane.style.transform = 'translate(' + window.cv.panX + 'px, ' + window.cv.panY + 'px) scale(' + window.cv.scale + ')';
    window.canvas_draw_lines(); window.canvas_draw_nodes();
};

window.edge_lock = false;
window.delete_edge = function(e, eid) { 
    if(e) { e.stopPropagation(); e.preventDefault(); }
    if(window.edge_lock) return; window.edge_lock = true; setTimeout(function(){ window.edge_lock = false; }, 300);
    if(!window.cv.isEdit) return; if(confirm("Delete relation?")) { window.cv.edges = window.cv.edges.filter(function(ed){return ed.id !== eid}); window.canvas_draw(); } 
};

window.cv_click = { id: null, timer: null };

window.handle_node_tap = function(nid) {
    if(!window.cv.isEdit) {
        window.show_node_profile(nid);
        return;
    }
    
    if(window.cv_click.id === nid) {
        clearTimeout(window.cv_click.timer); window.cv_click.id = null;
        window.remove_node_by_id(nid);
    } else {
        window.cv_click.id = nid;
        window.cv_click.timer = setTimeout(function() {
            window.cv_click.id = null;
            if(window.cv.selNodeId) {
                if(window.cv.selNodeId === nid) { window.cv.selNodeId = null; window.update_cv_ui(); window.canvas_draw(); }
                else { window.open_link_modal(window.cv.selNodeId, nid); }
            } else {
                window.show_node_profile(nid);
            }
        }, 300);
    }
};

window.show_node_profile = function(nid) {
    var chars = window.ar_get(); var nd = window.cv.nodes.find(function(n){return n.id === nid}); if(!nd) return;
    var c = chars.find(function(ch){return ch.id === nd.charId}); if(!c) return;
    document.getElementById('nim-av').src = c.avatar || ''; document.getElementById('nim-name').innerText = c.name || 'Unknown';
    document.getElementById('nim-role').innerText = (c.role==='main' ? 'Main Character' : 'NPC');
    document.getElementById('nim-per').innerText = c.persona || 'No persona details provided.';
    document.getElementById('nim-btn-link').style.display = window.cv.isEdit ? 'block' : 'none';
    window.nim_active_node = nid;
    document.getElementById('node-info-modal').classList.add('act');
};

window.start_link_from_modal = function() {
    document.getElementById('node-info-modal').classList.remove('act');
    if(window.cv.isEdit && window.nim_active_node) {
        window.cv.selNodeId = window.nim_active_node; window.update_cv_ui(); window.canvas_draw();
    }
};

window.remove_node_by_id = function(nid) {
    var nd = window.cv.nodes.find(function(n){return n.id === nid}); if(!nd) return;
    if(nd.charId === window.cv.mainId) return alert("Cannot remove Main Character!");
    if(confirm("Remove this character from map?")) {
        window.cv.nodes = window.cv.nodes.filter(function(n){return n.id !== nid});
        window.cv.edges = window.cv.edges.filter(function(e){return e.source !== nid && e.target !== nid});
        if(window.cv.selNodeId === nid) { window.cv.selNodeId = null; window.update_cv_ui(); }
        window.canvas_draw();
    }
};

window.init_canvas_events = function() {
    var cvWrap = document.getElementById('cv-wrap');
    var getDist = function(t1, t2) { return Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY); };

    var hStart = function(e) {
        if(e.target.closest('.cv-action-btn') || e.target.closest('.c-edge-text')) return; 
        var nodeEl = e.target.closest('.c-node');
        var tn = e.touches ? e.touches[0] : e;
        
        if(nodeEl) {
            var nid = nodeEl.getAttribute('data-nid');
            window.cv.draggingNodeId = nid; window.cv.nodeMoved = false;
            window.cv.nodeStartX = tn.clientX; window.cv.nodeStartY = tn.clientY;
            
            if(window.cv.isEdit) {
                var nd = window.cv.nodes.find(function(n){return n.id===nid});
                if(nd) { window.cv.nodeInitX = nd.x; window.cv.nodeInitY = nd.y; }
            } else {
                window.cv.isDragging = true;
                window.cv.startX = tn.clientX - window.cv.panX;
                window.cv.startY = tn.clientY - window.cv.panY;
                window.cv.initDragPanX = window.cv.panX; 
                window.cv.initDragPanY = window.cv.panY;
            }
            return;
        }
        
        if(e.touches && e.touches.length === 2) { window.cv.isPinching = true; window.cv.startDist = getDist(e.touches[0], e.touches[1]); window.cv.startScale = window.cv.scale; return; }
        
        window.cv.isDragging = true; 
        window.cv.startX = tn.clientX - window.cv.panX; 
        window.cv.startY = tn.clientY - window.cv.panY;
        
        window.cv.initDragPanX = window.cv.panX;
        window.cv.initDragPanY = window.cv.panY;
    };
    
    var hMove = function(e) {
        if(window.cv.isPinching && e.touches && e.touches.length === 2) {
            e.preventDefault(); var d = getDist(e.touches[0], e.touches[1]);
            window.cv.scale = window.cv.startScale * (d / window.cv.startDist); window.cv.scale = Math.max(0.3, Math.min(window.cv.scale, 3));
            document.getElementById('cv-plane').style.transform = 'translate(' + window.cv.panX + 'px, ' + window.cv.panY + 'px) scale(' + window.cv.scale + ')'; return;
        }
        
        var tn = e.touches ? e.touches[0] : e;
        
        if(window.cv.draggingNodeId && window.cv.isEdit) {
            e.preventDefault(); 
            var dx = tn.clientX - window.cv.nodeStartX; var dy = tn.clientY - window.cv.nodeStartY;
            if(Math.abs(dx)>5 || Math.abs(dy)>5) window.cv.nodeMoved = true;
            var nd = window.cv.nodes.find(function(n){return n.id===window.cv.draggingNodeId});
            if(nd) { nd.x = window.cv.nodeInitX + (dx / window.cv.scale); nd.y = window.cv.nodeInitY + (dy / window.cv.scale); var domNode = document.getElementById('dom_' + nd.id); if(domNode) { domNode.style.left = nd.x + 'px'; domNode.style.top = nd.y + 'px'; } window.canvas_draw_lines(); }
            return;
        } else if (window.cv.draggingNodeId && !window.cv.isEdit) {
            var dx = tn.clientX - window.cv.nodeStartX; var dy = tn.clientY - window.cv.nodeStartY;
            if(Math.abs(dx)>5 || Math.abs(dy)>5) window.cv.nodeMoved = true;
        }

        if(!window.cv.isDragging) return; e.preventDefault();
        window.cv.panX = tn.clientX - window.cv.startX; window.cv.panY = tn.clientY - window.cv.startY;
        document.getElementById('cv-plane').style.transform = 'translate(' + window.cv.panX + 'px, ' + window.cv.panY + 'px) scale(' + window.cv.scale + ')';
    };
    
    var hEnd = function(e) {
        if(window.cv.isPinching && (!e.touches || e.touches.length < 2)) { window.cv.isPinching = false; return; }
        
        if(window.cv.draggingNodeId) {
            var nid = window.cv.draggingNodeId; var moved = window.cv.nodeMoved;
            window.cv.draggingNodeId = null; window.cv.nodeMoved = false;
            if(!moved) { window.handle_node_tap(nid); } 
            if(window.cv.isEdit) return;
        }

        if(!window.cv.isDragging) return; window.cv.isDragging = false;
        
        var movedX = Math.abs(window.cv.panX - window.cv.initDragPanX); 
        var movedY = Math.abs(window.cv.panY - window.cv.initDragPanY);
        
        if(movedX < 5 && movedY < 5 && window.cv.isEdit && window.cv.selNodeId) { window.cv.selNodeId = null; window.update_cv_ui(); window.canvas_draw(); }
    };
    
    cvWrap.addEventListener('mousedown', hStart, {passive:false}); window.addEventListener('mousemove', hMove, {passive:false}); window.addEventListener('mouseup', hEnd);
    cvWrap.addEventListener('touchstart', hStart, {passive:false}); window.addEventListener('touchmove', hMove, {passive:false}); window.addEventListener('touchend', hEnd);
    cvWrap.addEventListener('wheel', function(e) { e.preventDefault(); window.cv.scale += e.deltaY < 0 ? 0.05 : -0.05; window.cv.scale = Math.max(0.3, Math.min(window.cv.scale, 3)); document.getElementById('cv-plane').style.transform = 'translate(' + window.cv.panX + 'px, ' + window.cv.panY + 'px) scale(' + window.cv.scale + ')'; }, {passive: false});
};

window.force_add_node = function() {
    if(!window.cv.isEdit) return; window.cv.selNodeId = null; window.canvas_draw();
    var rect = document.getElementById('cv-wrap').getBoundingClientRect();
    window.cv.tmpX = ((rect.width/2) - window.cv.panX) / window.cv.scale; window.cv.tmpY = ((rect.height/2) - window.cv.panY) / window.cv.scale;
    window.open_pick_npc();
};

window.open_pick_npc = function() {
    var chars = window.ar_get(); var listHTML = ''; var wChars = chars.filter(function(c){return c.worldId === window.cv.worldId});
    wChars = wChars.filter(function(c) { for(var k=0; k<window.cv.nodes.length; k++) { if(window.cv.nodes[k].charId === c.id) return false; } return true; });
    if(wChars.length === 0) listHTML = '<div style="text-align:center; color:#888;">All characters are already on the map!</div>';
    else {
        for(var i=0; i<wChars.length; i++) {
            var c = wChars[i]; listHTML += '<div style="padding:12px; border-bottom:1px solid #eee; display:flex; align-items:center; cursor:pointer;" onclick="place_npc(\''+c.id+'\')"><div style="width:30px; height:30px; border-radius:15px; background:#ddd; margin-right:10px; overflow:hidden;"><img src="'+(c.avatar||'')+'" style="width:100%;height:100%;object-fit:cover;"></div><div style="font-weight:600;">'+c.name+'</div></div>';
        }
    }
    document.getElementById('pick-npc-list').innerHTML = listHTML; document.getElementById('modal-pick-npc').classList.add('act');
};

window.place_npc = function(charId) {
    document.getElementById('modal-pick-npc').classList.remove('act');
    var newNodeId = 'N_' + new Date().getTime();
    var offsetX = (Math.random() * 80) - 40; var offsetY = (Math.random() * 80) - 40;
    window.cv.nodes.push({ id: newNodeId, charId: charId, x: window.cv.tmpX + offsetX, y: window.cv.tmpY + offsetY }); 
    window.cv.selNodeId = newNodeId; window.update_cv_ui(); window.canvas_draw();
};

window.open_link_modal = function(sourceId, targetId) {
    var chars = window.ar_get(); var n1 = window.cv.nodes.find(function(n){return n.id === sourceId}); var n2 = window.cv.nodes.find(function(n){return n.id === targetId});
    var c1 = chars.find(function(c){return c.id === n1.charId}); var c2 = chars.find(function(c){return c.id === n2.charId});
    document.getElementById('link-names').innerText = (c1?c1.name:'?') + " ➡️ " + (c2?c2.name:'?'); document.getElementById('link-label').value = '';
    window.cv.tmpSource = sourceId; window.cv.tmpTarget = targetId; document.getElementById('modal-link').classList.add('act');
};

window.submit_link = function() {
    var label = document.getElementById('link-label').value.trim() || 'Linked';
    window.cv.edges.push({ id: 'E_' + new Date().getTime(), source: window.cv.tmpSource, target: window.cv.tmpTarget, label: label });
    document.getElementById('modal-link').classList.remove('act'); window.cv.selNodeId = null; window.update_cv_ui(); window.canvas_draw();
};

setTimeout(function() {
    var appLayer = document.getElementById('app-layer');
    if (!appLayer) { appLayer = document.createElement('div'); appLayer.id = 'app-layer'; document.body.appendChild(appLayer); }
    if (appLayer.innerHTML.indexOf('ar-app') === -1) window.renderArchive();
}, 50);
