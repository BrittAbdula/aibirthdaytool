// 全局变量
let currentTranslations = {};

// 主要的应用逻辑封装在一个立即执行函数表达式（IIFE）中
(function() {
    let isGenerating = false;
    let controller = null;

    // DOM 元素引用
    let settingsIcon, settingsPanel, mainContent, uiLanguageSelect, recipientSelect,
        otherRecipientGroup, otherRecipientInput, otherRecipientWordCount, ageInput, ageValue,
        traitsContainer, toneSelect, customToneGroup, customToneInput, customToneWordCount,
        generateButton, resultDiv, messageContentDiv, stopButton, closeButton, copyButton;

    // 当 DOM 加载完成时初始化应用
    document.addEventListener('DOMContentLoaded', initializeApp);

    function initializeApp() {
        // 初始化 DOM 元素引用
        initializeDOMReferences();

        // 设置事件监听器
        setupEventListeners();

        // 初始化 UI
        initializeUI();
    }

    function initializeDOMReferences() {
        settingsIcon = document.getElementById('settingsIcon');
        settingsPanel = document.getElementById('settingsPanel');
        mainContent = document.querySelector('.main-content');
        uiLanguageSelect = document.getElementById('uiLanguage');
        recipientSelect = document.getElementById('recipient');
        otherRecipientGroup = document.getElementById('otherRecipientGroup');
        otherRecipientInput = document.getElementById('otherRecipient');
        otherRecipientWordCount = document.getElementById('otherRecipientWordCount');
        ageInput = document.getElementById('age');
        ageValue = document.getElementById('ageValue');
        traitsContainer = document.getElementById('traitsContainer');
        toneSelect = document.getElementById('tone');
        customToneGroup = document.getElementById('customToneGroup');
        customToneInput = document.getElementById('customTone');
        customToneWordCount = document.getElementById('customToneWordCount');
        generateButton = document.getElementById('generate');
        resultDiv = document.getElementById('result');
        messageContentDiv = document.getElementById('messageContent');
        stopButton = document.getElementById('stopButton');
        closeButton = document.getElementById('closeButton');
        copyButton = document.getElementById('copyButton');
    }

    function setupEventListeners() {
        settingsIcon.addEventListener('click', toggleSettingsPanel);
        uiLanguageSelect.addEventListener('change', changeUILanguage);
        recipientSelect.addEventListener('change', toggleOtherRecipient);
        ageInput.addEventListener('input', updateAgeValue);
        Array.from(traitsContainer.children).forEach(traitBubble => {
            traitBubble.addEventListener('click', () => toggleTrait(traitBubble));
        });
        toneSelect.addEventListener('change', toggleCustomTone);
        otherRecipientInput.addEventListener('input', () => updateWordCount(otherRecipientInput, otherRecipientWordCount));
        customToneInput.addEventListener('input', () => updateWordCount(customToneInput, customToneWordCount));
        generateButton.addEventListener('click', generateMessage);
        stopButton.addEventListener('click', stopGeneration);
        closeButton.addEventListener('click', closeResult);
        copyButton.addEventListener('click', copyMessage);
        window.addEventListener('resize', updateStopButtonPosition);
    }

    function initializeUI() {
        showPanel(mainContent);
        chrome.storage.local.get('uiLanguage', function(data) {
            const defaultLanguage = chrome.i18n.getUILanguage().split('-')[0];
            const language = data.uiLanguage || defaultLanguage;
            uiLanguageSelect.value = language;
            loadTranslations(language).then(() => translateUI());
        });
        setDefaultMessageLanguage();
    }

    // UI 相关函数
    function toggleSettingsPanel() {
        if (settingsPanel.style.display === 'none' || settingsPanel.style.display === '') {
            showPanel(settingsPanel);
        } else {
            showPanel(mainContent);
        }
    }

    function showPanel(panelToShow) {
        settingsPanel.style.display = 'none';
        mainContent.style.display = 'none';
        panelToShow.style.display = 'block';
    }

    function changeUILanguage() {
        const newLanguage = this.value;
        chrome.storage.local.set({uiLanguage: newLanguage}, function() {
            loadTranslations(newLanguage).then(() => translateUI());
            location.reload();
        });
    }

    function toggleOtherRecipient() {
        otherRecipientGroup.style.display = this.value === 'Other' ? 'block' : 'none';
    }

    function updateAgeValue() {
        ageValue.textContent = this.value;
    }

    function toggleCustomTone() {
        customToneGroup.style.display = this.value === 'Custom' ? 'block' : 'none';
    }

    function updateWordCount(input, countElement) {
        const words = input.value.trim().split(/\s+/).length;
        countElement.textContent = `${words}/100`;
    }

    function toggleTrait(bubble) {
        const selectedTraits = document.querySelectorAll('.trait-bubble.selected');
        if (bubble.classList.contains('selected')) {
            bubble.classList.remove('selected');
        } else if (selectedTraits.length < 3) {
            bubble.classList.add('selected');
        } else {
            selectedTraits[0].classList.remove('selected');
            bubble.classList.add('selected');
        }
    }

    // 消息生成相关函数
    function generateMessage() {
        if (isGenerating) return;

        let recipient = recipientSelect.value;
        if (recipient === 'Other') {
            recipient = otherRecipientInput.value.split(/\s+/).slice(0, 100).join(' ');
        }
        const age = ageInput.value;
        const selectedTraits = Array.from(document.querySelectorAll('.trait-bubble.selected')).map(bubble => bubble.textContent);
        let tone = toneSelect.value;
        if (tone === 'Custom') {
            tone = customToneInput.value.split(/\s+/).slice(0, 100).join(' ');
        }
        const messageLength = document.getElementById('messageLength').value;
        const language = document.getElementById('language').value;

        if (!recipient || !age) {
            alert(getMessage('fillAllFields') || 'Please fill in all required fields.');
            return;
        }

        isGenerating = true;
        messageContentDiv.textContent = getMessage('generatingMessage') || 'Generating message...';
        resultDiv.style.display = 'block';
        showStopButton();

        controller = new AbortController();
        const signal = controller.signal;
        console.log({ recipient, age, traits: selectedTraits, tone, messageLength, language })

        fetch('https://greetly.auroroa.workers.dev/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ recipient, age, traits: selectedTraits, tone, messageLength, language }),
            signal: signal
        })
        .then(response => {
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let message = '';

            function readStream() {
                reader.read().then(({ done, value }) => {
                    if (done || !isGenerating) {
                        endGeneration();
                        return;
                    }
                    const chunk = decoder.decode(value);
                    const lines = chunk.split('\n');
                    lines.forEach(line => {
                        if (line.startsWith('data: ')) {
                            const content = line.slice(6).trim();
                            if (content === "[DONE]") {
                                endGeneration();
                            } else {
                                try {
                                    const data = JSON.parse(content);
                                    if (data.response) {
                                        message += data.response;
                                        messageContentDiv.textContent = message;
                                        updateStopButtonPosition();
                                    }
                                } catch (e) {
                                    console.error('Error parsing JSON:', e);
                                }
                            }
                        }
                    });
                    if (isGenerating) readStream();
                });
            }

            readStream();
        })
        .catch(error => {
            if (error.name === 'AbortError') {
                console.log('Fetch aborted');
            } else {
                messageContentDiv.textContent = 'Error: ' + error.message;
            }
            endGeneration();
        });
    }

    function stopGeneration() {
        if (isGenerating) {
            isGenerating = false;
            if (controller) {
                controller.abort();
            }
            messageContentDiv.textContent += "\n\n[Generation stopped]";
            endGeneration();
        }
    }

    function showStopButton() {
        stopButton.style.display = 'flex';
        updateStopButtonPosition();
    }

    function hideStopButton() {
        stopButton.style.display = 'none';
    }

    function updateStopButtonPosition() {
        const contentHeight = messageContentDiv.scrollHeight;
        const newPosition = Math.min(contentHeight, window.innerHeight - 100);
        stopButton.style.top = `${newPosition}px`;
    }

    function endGeneration() {
        isGenerating = false;
        hideStopButton();
    }

    function closeResult() {
        resultDiv.style.display = 'none';
    }

    function copyMessage() {
        const textToCopy = messageContentDiv.innerText;
        navigator.clipboard.writeText(textToCopy).then(() => {
            copyButton.style.color = '#4CD964';
            setTimeout(() => copyButton.style.color = '#FF9999', 1000);
        });
    }

    // 翻译相关函数
    function loadTranslations(language) {
        return fetch(`_locales/${language}/messages.json`)
            .then(response => response.json())
            .then(data => {
                currentTranslations = data;
            })
            .catch(error => {
                console.error('Error loading translations:', error);
                return fetch('_locales/en/messages.json')
                    .then(response => response.json())
                    .then(data => {
                        currentTranslations = data;
                    });
            });
    }

    function getMessage(key) {
        return currentTranslations[key]?.message || chrome.i18n.getMessage(key) || key;
    }

    function translateUI() {
        document.getElementById('extName').textContent = getMessage('extName');
        document.querySelector('#settingsPanel h2').textContent = getMessage('settings');
        document.querySelector('label[for="uiLanguage"]').textContent = getMessage('language');
        document.querySelector('label[for="recipient"]').textContent = getMessage('recipient');
        document.querySelector('label[for="age"]').textContent = getMessage('age');
        document.querySelector('label[for="tone"]').textContent = getMessage('tone');
        document.querySelector('label[for="messageLength"]').textContent = getMessage('messageLength');
        document.querySelector('label[for="language"]').textContent = getMessage('messageLanguage');
        generateButton.textContent = getMessage('generateMessage');
        document.querySelector('label[for="traitsContainer"]').textContent = getMessage('traits');

        translateSelect('recipient');
        translateSelect('tone');
        translateSelect('messageLength');
        translateSelect('language');

        document.querySelector('label[for="otherRecipient"]').textContent = getMessage('specifyRecipient');
        otherRecipientInput.placeholder = getMessage('enterRecipient');
        document.querySelector('label[for="customTone"]').textContent = getMessage('customTone');
        customToneInput.placeholder = getMessage('enterCustomTone');

        translateTraits();
    }

    function translateSelect(selectId) {
        const select = document.getElementById(selectId);
        const originalValue = select.value;
        
        Array.from(select.options).forEach(option => {
            if (option.value) {
                const translationKey = option.value.toLowerCase().replace(/\s+/g, '');
                option.textContent = getMessage(translationKey);
            } else {
                const placeholderKey = 'select' + selectId.charAt(0).toUpperCase() + selectId.slice(1);
                option.textContent = getMessage(placeholderKey);
            }
        });
        
        select.value = originalValue;
    }

    function translateTraits() {
        const traitBubbles = document.querySelectorAll('.trait-bubble');
        traitBubbles.forEach(bubble => {
            const originalText = bubble.textContent;
            const translationKey = originalText.toLowerCase().replace(/\s+/g, '');
            bubble.textContent = getMessage(translationKey);
        });
    }
})();

function setDefaultMessageLanguage() {
    const selectElement = document.getElementById('uiLanguage');
    const messageLanguageSelect = document.getElementById('language');

    // 从 chrome.storage 中获取语言设置
    chrome.storage.local.get('uiLanguage', function(data) {
        const selectedValue = data.uiLanguage || 'en'; // 默认值为 'en'
        console.log('UI language from storage:', selectedValue);

        let uiLanguage = '';

        // 遍历选项查找对应的文本
        for (let i = 0; i < selectElement.options.length; i++) {
            if (selectElement.options[i].value === selectedValue) {
                uiLanguage = selectElement.options[i].text; // 获取对应的文本
                break; // 找到后退出循环
            }
        }
        console.log('UI language:', uiLanguage);

        // 检查是否存在匹配的选项
        if (Array.from(messageLanguageSelect.options).some(option => option.value === uiLanguage)) {
            messageLanguageSelect.value = uiLanguage;
        } else {
            console.log('No matching language found for:', uiLanguage);
            // 设置默认值为英语
            messageLanguageSelect.value = 'en';
        }
    });
}