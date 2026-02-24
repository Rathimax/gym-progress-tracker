import sys

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace Sidebar and Bottom Nav Analytics -> AI Assistant
html = html.replace(
    'data-target="view-analytics"><span class="icon"><i\n            class="ri-bar-chart-grouped-line"></i></span> <span class="label">Analytics</span>',
    'data-target="view-ai"><span class="icon"><i class="ri-robot-2-fill"></i></span> <span class="label">AI Assistant</span>'
)
html = html.replace(
    '<div class="nav-item" data-target="view-analytics">\n      <span class="icon"><i class="ri-bar-chart-grouped-line"></i></span>\n      <span class="label">Analytics</span>\n    </div>',
    '<div class="nav-item" data-target="view-ai">\n      <span class="icon"><i class="ri-robot-2-fill"></i></span>\n      <span class="label">AI Assistant</span>\n    </div>'
)

start_m = '    <!-- VIEW 2: ANALYTICS -->\n    <div id="view-analytics" class="view-section">\n'
end_m = '    </div>\n\n    <!-- VIEW 3: HISTORY -->'

if start_m in html and end_m in html:
    start_idx = html.find(start_m) + len(start_m)
    end_idx = html.find(end_m)
    analytics_content = html[start_idx:end_idx]
    
    ai_ui = """      <div class="card card-wide" style="height: 70vh; display: flex; flex-direction: column;">
        <h2><span class="icon"><i class="ri-sparkling-fill"></i></span> FitTrack AI Assistant</h2>
        <div id="ai-chat-messages" style="flex: 1; overflow-y: auto; padding: 1rem; display: flex; flex-direction: column; gap: 1rem; border-radius: 12px; background: rgba(0,0,0,0.02)">
          <div class="ai-message bot" style="align-self: flex-start; background: var(--input-bg); padding: 1rem; border-radius: 12px; max-width: 80%; line-height: 1.5;">
            Hello! I'm your FitTrack AI. I can analyze your workout history, suggest routines, and answer gym-related questions. How can I help?
          </div>
        </div>
        <div class="ai-input-area" style="display: flex; gap: 0.5rem; margin-top: 1rem; border-top: 1px solid var(--card-border); padding-top: 1rem;">
          <input type="text" id="ai-chat-input" placeholder="Ask about your progress or workouts..." style="flex: 1; padding: 0.8rem; border-radius: 8px; border: 1px solid var(--card-border); background: var(--input-bg); color: var(--text);" />
          <button id="ai-chat-send" style="width: auto; padding: 0.8rem 1.2rem; background: var(--accent-gradient); color: white; border-radius: 8px; border: none; cursor: pointer;"><i class="ri-send-plane-fill"></i></button>
        </div>
      </div>\n"""

    # Replace old view-analytics with view-ai
    html = html[:html.find(start_m)] + '    <!-- VIEW 2: AI ASSISTANT -->\n    <div id="view-ai" class="view-section">\n' + ai_ui + html[end_idx:]

    # Insert analytics just before the end of view-settings
    settings_end = html.find('    </div>\n\n  </div>\n\n  <!-- Mobile Bottom Navigation -->')
    if settings_end != -1:
        html = html[:settings_end] + analytics_content + html[settings_end:]
        with open('index.html', 'w', encoding='utf-8') as f:
            f.write(html)
        print('SUCCESS')
    else:
        print('FAILED to find settings end')
else:
    print('FAILED to find analytics block')
