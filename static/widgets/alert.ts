// Copyright (c) 2021, Compiler Explorer Authors
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright notice,
//       this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
// AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
// ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
// LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
// SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
// INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
// CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
// ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
// POSSIBILITY OF SUCH DAMAGE.

import {Toast} from 'bootstrap';
import $ from 'jquery';

import * as BootstrapUtils from '../bootstrap-utils.js';
import {AlertAskOptions, AlertEnterTextOptions, AlertNotifyOptions} from './alert.interfaces.js';

export class Alert {
    yesHandler: ((answer?: string | string[] | number) => void) | null = null;
    noHandler: (() => void) | null = null;
    prefixMessage = '';

    constructor() {
        const yesNoModal = $('#yes-no');
        yesNoModal.find('button.yes').on('click', () => {
            this.yesHandler?.();
        });
        yesNoModal.find('button.no').on('click', () => {
            this.noHandler?.();
        });
    }

    private toggleEventListener(element: JQuery, eventName: string, callback: (event: JQuery.Event) => void): void {
        element.on(eventName, (event: JQuery.Event) => {
            callback(event);
            element.off(eventName);
            this.yesHandler = null;
            this.noHandler = null;
        });
    }
    /**
     * Display an alert with a title and a body
     */
    alert(title: string, body: string, {onClose, isError}: {onClose?: () => void; isError?: boolean} = {}) {
        const modal = $('#alert');
        modal.toggleClass('error-alert', isError === true);
        modal.find('.modal-title').html(title);
        modal.find('.modal-body').html(body);
        BootstrapUtils.showModal(modal);

        if (onClose) {
            BootstrapUtils.setElementEventHandler(modal, 'hidden.bs.modal', onClose);
        }
        return modal;
    }

    /**
     * Asks the user a two choice question, where the title, content and buttons are customizable
     */
    ask(title: string, question: string, askOptions: AlertAskOptions) {
        const modal = $('#yes-no');
        this.yesHandler = askOptions.yes ?? (() => undefined);
        this.noHandler = askOptions.no ?? (() => undefined);
        modal.find('.modal-title').html(title);
        modal.find('.modal-body').css('min-height', 'inherit').html(question);
        if (askOptions.yesHtml) modal.find('.modal-footer .yes').html(askOptions.yesHtml);
        if (askOptions.yesClass) {
            modal.find('.modal-footer .yes').removeClass('btn-link').addClass(askOptions.yesClass);
        }
        if (askOptions.noHtml) modal.find('.modal-footer .no').html(askOptions.noHtml);
        if (askOptions.noClass) {
            modal.find('.modal-footer .no').removeClass('btn-link').addClass(askOptions.noClass);
        }
        if (askOptions.onClose) {
            BootstrapUtils.setElementEventHandler(modal, 'hidden.bs.modal', askOptions.onClose);
        }

        BootstrapUtils.showModal(modal);
        return modal;
    }

    /**
     * Notifies the user of something by a popup which can be stacked, auto-dismissed, etc... based on options
     */
    notify(
        body: string,
        {
            group = '',
            collapseSimilar = true,
            alertClass = '',
            autoDismiss = true,
            dismissTime = 5000,
            onBeforeShow = () => {},
        }: AlertNotifyOptions,
    ) {
        const container = $('#notifications');
        const newElement = $(`
            <div class="toast" tabindex="-1" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header ${alertClass}">
                    <strong class="me-auto">${this.prefixMessage}</strong>
                    <button type="button" class="ms-2 mb-1 btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
                <div class="toast-body ${alertClass}">
                    <span id="msg">${body}</span>
               </div>
            </div>
        `);
        container.append(newElement);
        const toastOptions = {
            autohide: autoDismiss,
            delay: dismissTime,
        };

        new Toast(newElement[0], toastOptions);

        if (group !== '') {
            if (collapseSimilar) {
                // Only collapsing if a group has been specified
                const old = container.find(`[data-group="${group}"]`);
                old.each((_, element) => {
                    BootstrapUtils.hideToast(element);
                    $(element).remove();
                });
            }
            newElement.attr('data-group', group);
        }
        onBeforeShow(newElement);
        BootstrapUtils.showToast(newElement);
    }

    /**
     * Asks the user a two choice question, where the title, content and buttons are customizable
     */
    enterSomething(title: string, question: string, defaultValue: string, askOptions: AlertEnterTextOptions) {
        const modal = $('#enter-something');
        this.yesHandler = askOptions.yes ?? (() => undefined);
        this.noHandler = askOptions.no ?? (() => undefined);
        modal.find('.modal-title').html(title);
        modal.find('.modal-body .question').html(question);

        const yesButton = modal.find('.modal-footer .yes');
        this.toggleEventListener(yesButton, 'click', () => {
            const answer = modal.find('.question-answer');
            this.yesHandler?.(answer.val());
        });

        const noButton = modal.find('.modal-footer .no');
        this.toggleEventListener(noButton, 'click', () => {
            this.noHandler?.();
        });

        const answerEdit = modal.find('.modal-body .question-answer');
        answerEdit.val(defaultValue);
        answerEdit.on('keyup', e => {
            if (e.keyCode === 13 || e.which === 13) {
                yesButton.trigger('click');
            }
        });

        if (askOptions.yesHtml) yesButton.html(askOptions.yesHtml);
        if (askOptions.yesClass) {
            yesButton.removeClass('btn-light').addClass(askOptions.yesClass);
        }
        if (askOptions.noHtml) noButton.html(askOptions.noHtml);
        if (askOptions.noClass) {
            noButton.removeClass('btn-light').addClass(askOptions.noClass);
        }
        if (askOptions.onClose) {
            BootstrapUtils.setElementEventHandler(modal, 'hidden.bs.modal', askOptions.onClose);
        }

        BootstrapUtils.setElementEventHandler(modal, 'shown.bs.modal', () => {
            answerEdit.trigger('focus');
        });
        BootstrapUtils.showModal(modal);
        return modal;
    }
}
