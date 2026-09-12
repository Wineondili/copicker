import Foundation
import JavaScriptCore
import Testing

private func settingsBridgeContext(legacy: Bool = false) throws -> JSContext {
    let root = URL(fileURLWithPath: #filePath)
        .deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent()
    let html = try String(contentsOf: root.appendingPathComponent(
        "Sources/CopickerCLI/Resources/copicker-settings-v2.html"
    ), encoding: .utf8)
    let start = try #require(html.range(of: "<script>")?.upperBound)
    let end = try #require(html.range(of: "</script>", range: start..<html.endIndex)?.lowerBound)
    let context = try #require(JSContext())
    context.exceptionHandler = { _, exception in
        if let exception { Issue.record("Settings bridge fixture failed: \(exception)") }
    }
    context.evaluateScript(#"""
    var harness = (() => {
      const elements = new Map(), messages = [], timers = new Map(), listeners = [];
      let nextTimer = 0, legacyCalls = 0;
      function element(key) {
        if (!elements.has(key)) elements.set(key, {
          value:key, checked:false, disabled:false, textContent:'', dataset:{},
          style:{setProperty(name,value){this[name]=value;}}, handlers:new Map(),
          setAttribute(name,value){this[name]=value;},
          addEventListener(type,fn){this.handlers.set(type,fn);}
        });
        return elements.get(key);
      }
      const models = ['astra','sol','terra','luna','daybreak-blue','gpt-5.5','gpt-5.3-codex-spark'];
      const snapshot = {schemaVersion:1,revision:0,enabled:true,visibleModels:['sol','terra','luna'],preferredPlacement:'top',appearance:'dark'};
      const parent = {postMessage(message){messages.push(message);}};
      const document = {
        documentElement:element('html'), querySelector:element,
        querySelectorAll(selector){
          const values = selector.includes('visible-model') ? models : selector.includes('placement') ? ['top','left','right'] : ['codex','system','light','dark'];
          return values.map(element);
        }
      };
      const window = {
        parent, addEventListener(type,fn){if(type==='message')listeners.push(fn);},
        setTimeout(fn){const id=++nextTimer;timers.set(id,fn);return id;},
        clearTimeout(id){timers.delete(id);}
      };
      function deliver(message, trusted=true) {
        listeners.forEach(fn=>fn({source:trusted?parent:{},data:message}));
      }
      return {
        window,document,messages,snapshot,element,
        reply(index,result,error=null,trusted=true){deliver({jsonrpc:'2.0',id:messages[index].id,result,error},trusted);},
        initialized(){this.reply(0,{protocolVersion:'2025-11-21',hostContext:{theme:'dark'}});},
        loaded(){this.reply(messages.length-1,{structuredContent:snapshot});},
        notify(method,params,trusted=true){deliver({jsonrpc:'2.0',method,params},trusted);},
        expire(){const pending=[...timers.values()];timers.clear();pending.forEach(fn=>fn());},
        click(key){element(key).handlers.get('click')({target:element(key)});},
        toggle(key){const el=element(key);el.checked=!el.checked;el.handlers.get('change')({target:el});},
        enableLegacy(){window.openai={callTool(){legacyCalls++;return Promise.resolve({structuredContent:snapshot});}};},
        get legacyCalls(){return legacyCalls;},
        get methods(){return messages.map(message=>message.method).join(',');},
        get state(){return element('main').dataset.bridgeState;},
        get status(){return element('#save-state').textContent;}
      };
    })();
    var window=harness.window, document=harness.document;
    """#)
    if legacy { context.evaluateScript("harness.enableLegacy()") }
    context.evaluateScript(String(html[start..<end]))
    return context
}

@Test
func nativeSettingsInitializesBeforeReadingOrEnablingControls() throws {
    let context = try settingsBridgeContext()
    #expect(context.evaluateScript("harness.methods")?.toString() == "ui/initialize")
    #expect(context.evaluateScript("harness.element('#enabled').disabled")?.toBool() == true)
    context.evaluateScript("harness.initialized()")
    #expect(context.evaluateScript("harness.methods")?.toString() == "ui/initialize,ui/notifications/initialized,tools/call")
    #expect(context.evaluateScript("document.documentElement.style.colorScheme")?.toString() == "dark")
    context.evaluateScript("harness.loaded()")
    #expect(context.evaluateScript("harness.state")?.toString() == "ready")
    #expect(context.evaluateScript("harness.status")?.toString() == "已保存 · 下次注入生效")
    #expect(context.evaluateScript("harness.element('#enabled').disabled")?.toBool() == false)
}

@Test
func nativeSettingsIgnoresForeignMessagesAndUnsolicitedEarlyResults() throws {
    let context = try settingsBridgeContext()
    context.evaluateScript("harness.reply(0,{protocolVersion:'2025-11-21'},null,false)")
    context.evaluateScript("harness.notify('ui/notifications/tool-result',{structuredContent:harness.snapshot})")
    #expect(context.evaluateScript("harness.methods")?.toString() == "ui/initialize")
    #expect(context.evaluateScript("harness.element('#enabled').disabled")?.toBool() == true)
    context.evaluateScript("harness.initialized(); harness.loaded()")
    context.evaluateScript("harness.notify('ui/notifications/host-context-changed',{theme:'light'},false)")
    #expect(context.evaluateScript("document.documentElement.style.colorScheme")?.toString() == "dark")
    context.evaluateScript("harness.notify('ui/notifications/host-context-changed',{theme:'light'})")
    #expect(context.evaluateScript("document.documentElement.style.colorScheme")?.toString() == "light")
}

@Test
func nativeSettingsCanRetryInitializationWithoutAcceptingLateReplies() throws {
    let context = try settingsBridgeContext()
    context.evaluateScript("harness.expire()")
    #expect(context.evaluateScript("harness.state")?.toString() == "error")
    #expect(context.evaluateScript("harness.element('#enabled').disabled")?.toBool() == true)
    context.evaluateScript("harness.click('#retry')")
    context.evaluateScript("harness.reply(0,{protocolVersion:'2025-11-21'})")
    #expect(context.evaluateScript("harness.methods")?.toString() == "ui/initialize,ui/initialize")
    context.evaluateScript("harness.reply(1,{protocolVersion:'2025-11-21'})")
    context.evaluateScript("harness.loaded()")
    #expect(context.evaluateScript("harness.state")?.toString() == "ready")
}

@Test
func nativeSettingsNeverReplaysTimedOutWritesOnLegacyTransport() throws {
    let context = try settingsBridgeContext(legacy: true)
    context.evaluateScript("harness.initialized()")
    context.evaluateScript("harness.loaded()")
    context.evaluateScript("harness.toggle('astra')")
    #expect(context.evaluateScript("harness.messages.at(-1).params.name")?.toString() == "copicker_settings_save")
    context.evaluateScript("harness.expire()")
    #expect(context.evaluateScript("harness.legacyCalls")?.toInt32() == 0)
    #expect(context.evaluateScript("harness.status")?.toString() == "保存失败")
    #expect(context.evaluateScript("harness.messages.filter(message=>message.method==='ui/initialize').length")?.toInt32() == 1)
}

@Test
func nativeSettingsUsesLegacyOnlyWhenInitializationIsUnsupported() throws {
    let context = try settingsBridgeContext(legacy: true)
    context.evaluateScript("harness.reply(0,null,{code:-32601,message:'Method not found'})")
    #expect(context.evaluateScript("harness.state")?.toString() == "legacy")
    #expect(context.evaluateScript("harness.legacyCalls")?.toInt32() == 1)
    #expect(context.evaluateScript("harness.status")?.toString() == "已保存 · 下次注入生效")

    let refused = try settingsBridgeContext(legacy: true)
    refused.evaluateScript("harness.reply(0,null,{code:-32000,message:'Not allowed'})")
    #expect(refused.evaluateScript("harness.state")?.toString() == "error")
    #expect(refused.evaluateScript("harness.legacyCalls")?.toInt32() == 0)
}

@Test
func nativeSettingsRejectsUnsupportedProtocolWithoutSendingToolCalls() throws {
    let context = try settingsBridgeContext()
    context.evaluateScript("harness.reply(0,{protocolVersion:'unsupported'})")
    #expect(context.evaluateScript("harness.state")?.toString() == "error")
    #expect(context.evaluateScript("harness.methods")?.toString() == "ui/initialize")
}
