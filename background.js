function startAutoClickVote(maxClicks, delayBetweenClicks, breakDuration) {
    window.alert = function() {};
    window.confirm = function() { return true; };
    window.prompt = function() { return null; };

    function closeAlertDialog() {
        let dialogs = document.querySelectorAll('dialog');
        dialogs.forEach(dialog => dialog.close());
    }

    function observeForAlerts() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    closeAlertDialog();
                }
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    observeForAlerts();

    const browserApi = typeof browser !== 'undefined' ? browser : chrome;
    browserApi.storage.local.get('autoClickRunning', (data) => {
        if (data.autoClickRunning) return;
        browserApi.storage.local.set({ autoClickRunning: true });
    });
    
        browserApi.storage.local.get(['clickCount', 'totalClickCount', 'captchaMissCount'], (data) => {
            let clickCount = data.clickCount || 0;
            let captchaMissCount = data.captchaMissCount || 0;
            console.log("click count: " + clickCount);

            function autoClick() {
                try {
                    let totalClickCount = data.totalClickCount || 0;

                    if (clickCount >= maxClicks || captchaMissCount >= 5) {
                        console.log("Waiting for 1 minute");
                        console.log("Total vote: " + totalClickCount);
                        browserApi.storage.local.get('intervalId', (data2) => {
                            if (data2.intervalId) {
                                clearInterval(data2.intervalId);
                            }
                        });
                        setTimeout(() => {
                            clickCount = 0;
                            captchaMissCount = 0;
                            browserApi.storage.local.set({ clickCount, captchaMissCount });
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
                                        ++totalClickCount;
                                        ++clickCount;
                                        browserApi.storage.local.set({ totalClickCount, clickCount });
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
                                captchaMissCount++;
                                browserApi.storage.local.set({ captchaMissCount });
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
                        }, 1000);

                    } else {
                        console.log('Radio button or vote button not found');
                    }
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
