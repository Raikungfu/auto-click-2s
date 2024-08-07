


function startAutoClickVote(maxClicks, delayBetweenClicks, breakDuration) {
    const browserApi = typeof browser !== 'undefined' ? browser : chrome;
    browserApi.storage.local.get('autoClickRunning', (data) => {
        if (data.autoClickRunning) return;

        data.autoClickRunning = true;
    });

    browserApi.storage.local.get('clickCount', (data) => {
        let clickCount = data.clickCount || 0;
        console.log("click count: " + clickCount);

        function autoClick() {
            try{
                if (clickCount >= maxClicks) {
                    console.log("Waiting for 1 minutes");
                    browserApi.storage.local.get('intervalId', (data) => {
                        if (data.intervalId) {
                            clearInterval(data.intervalId);
                        }
                    });
                    setTimeout(() => {
                        clickCount = 0;
                        browserApi.storage.local.set({ clickCount });
                        let intervalId = setInterval(autoClick, delayBetweenClicks);
                        browserApi.storage.local.set({ intervalId });
                    }, breakDuration);
                    return;
                }
    
                const radioButton = document.querySelector('input[type="radio"][value="63080042"]');
                const voteButton = document.getElementById('pd-vote-button14165530');
    
                if (radioButton && voteButton) {
                    radioButton.click();
                    voteButton.click();
    
                    setTimeout(() => {
                        const captchaElement = document.querySelector('.h-captcha p');
                        if (captchaElement) {
                            const captchaText = captchaElement.textContent;
                            const [operand1, operand2] = captchaText.match(/\d+/g).map(Number);
                            const result = operand1 + operand2;
    
                            const answerInput = document.querySelector('.h-captcha input[type="text"]');
                            if (answerInput) {
                                answerInput.value = result;
                                const submitButton = document.getElementById('pd-vote-button14165530');
                                if (submitButton) {
                                    submitButton.click();
                                    new Promise((resolve) => {
                                        const observer = new MutationObserver((mutations) => {
                                            mutations.forEach((mutation) => {
                                                if (mutation.type === 'childList') {
                                                    const captchaResponse = document.querySelector('.pds-question-top');
                                                    if (captchaResponse && captchaResponse.textContent.includes('Thank you for voting!')) {
                                                        observer.disconnect();
                                                        resolve();
                                                    }
                                                }
                                            });
                                        });
    
                                        observer.observe(document.body, { childList: true, subtree: true });
    
                                        setTimeout(() => {
                                            observer.disconnect();
                                            resolve();
                                        }, 5000);
                                    }).then(() => {
                                        console.log('Captcha submitted, reloading page...');
                                        location.reload();
                                    }).catch((error) => {
                                        console.error('Error while waiting for captcha submission:', error);
                                    });
                                }
                            }
                        } else {
                            console.log('Captcha not found');
                            new Promise((resolve) => {
                                const observer = new MutationObserver((mutations) => {
                                    mutations.forEach((mutation) => {
                                        if (mutation.type === 'childList') {
                                            const captchaResponse = document.querySelector('.pds-question-top');
                                            if (captchaResponse && captchaResponse.textContent.includes('Thank you for voting!')) {
                                                observer.disconnect();
                                                resolve();
                                            }
                                        }
                                    });
                                });
    
                                observer.observe(document.body, { childList: true, subtree: true });
    
                                setTimeout(() => {
                                    observer.disconnect();
                                    resolve();
                                }, 5000);
                            }).then(() => {
                                console.log('Captcha submitted, reloading page...');
                                location.reload();
                            }).catch((error) => {
                                console.error('Error while waiting for captcha submission:', error);
                            });
                        }
                    }, 2000);
    
                    clickCount++;
                    browserApi.storage.local.set({ clickCount });
                } else {
                    console.log('Radio button or vote button not found');
                }
                console.log("background");
            
            } catch (error) {
                console.error('Error detected, reloading page...', error);
                location.reload();
            }
        }

        browserApi.storage.local.get('intervalId', (data) => {
            if (data.intervalId) {
                clearInterval(data.intervalId);
            }
            let intervalId = setInterval(autoClick, delayBetweenClicks);
            browserApi.storage.local.set({ intervalId });
        });
    });
}

function stopAutoClickVote() {
    const browserApi = typeof browser !== 'undefined' ? browser : chrome;
    browserApi.storage.local.set({ autoClickRunning: false });
    browserApi.storage.local.get('intervalId', (data) => {
        if (data.intervalId) {
            clearInterval(data.intervalId);
        }
    });
}
