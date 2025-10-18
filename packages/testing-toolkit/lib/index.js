var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
export function inputText(canvasElement, linkId, text) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const questionElement = yield findByLinkId(canvasElement, linkId);
        const input = (_a = questionElement === null || questionElement === void 0 ? void 0 : questionElement.querySelector('input')) !== null && _a !== void 0 ? _a : questionElement === null || questionElement === void 0 ? void 0 : questionElement.querySelector('textarea');
        if (!input) {
            throw new Error(`Input or textarea was not found inside ${`[data-linkid=${linkId}] block`}`);
        }
        fireEvent.change(input, { target: { value: text } });
        // Here we await for debounced store update
        yield new Promise((resolve) => setTimeout(resolve, 500));
    });
}
export function checkCheckBox(canvasElement, linkId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const questionElement = yield findByLinkId(canvasElement, linkId);
        const input = (_a = questionElement === null || questionElement === void 0 ? void 0 : questionElement.querySelector('input')) !== null && _a !== void 0 ? _a : questionElement === null || questionElement === void 0 ? void 0 : questionElement.querySelector('textarea');
        if (!input) {
            throw new Error(`Input or textarea was not found inside ${`[data-linkid=${linkId}] block`}`);
        }
        fireEvent.click(input);
        // Here we await for debounced store update
        yield new Promise((resolve) => setTimeout(resolve, 500));
    });
}
export function inputFile(canvasElement, linkId, files, url, filename) {
    return __awaiter(this, void 0, void 0, function* () {
        const questionElement = yield findByLinkId(canvasElement, linkId);
        const input = questionElement === null || questionElement === void 0 ? void 0 : questionElement.querySelector('input');
        const textareaUrl = questionElement === null || questionElement === void 0 ? void 0 : questionElement.querySelector(`textarea[data-test="q-item-attachment-url"]`);
        const textareaName = questionElement === null || questionElement === void 0 ? void 0 : questionElement.querySelector(`textarea[data-test="q-item-attachment-file-name"]`);
        if (!input) {
            throw new Error(`File input was not found inside [data-linkid=${linkId}] block`);
        }
        if (!textareaUrl) {
            throw new Error(`File input was not found inside [data-linkid="URL"] block`);
        }
        if (!textareaName) {
            throw new Error(`File input was not found inside [data-linkid="File name (optional)"] block`);
        }
        const fileList = Array.isArray(files) ? files : [files];
        yield userEvent.upload(input, fileList);
        fireEvent.change(textareaUrl, { target: { value: url } });
        fireEvent.change(textareaName, { target: { value: filename } });
        // Here we await for debounced store update
        yield new Promise((resolve) => setTimeout(resolve, 500));
    });
}
export function inputDate(canvasElement, linkId, text) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield inputText(canvasElement, linkId, text);
    });
}
export function inputTime(canvasElement, linkId, text) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield inputText(canvasElement, linkId, text);
    });
}
export function inputReference(canvasElement, linkId, text) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield inputText(canvasElement, linkId, text);
    });
}
export function inputDecimal(canvasElement, linkId, text) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield inputText(canvasElement, linkId, text);
    });
}
export function inputUrl(canvasElement, linkId, text) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield inputText(canvasElement, linkId, text);
    });
}
export function inputInteger(canvasElement, linkId, text) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield inputText(canvasElement, linkId, text);
    });
}
export function inputDateTime(canvasElement, linkId, date, time, amPm) {
    return __awaiter(this, void 0, void 0, function* () {
        const questionElement = yield findByLinkId(canvasElement, linkId);
        console.log(questionElement, 777);
        const inputDate = questionElement === null || questionElement === void 0 ? void 0 : questionElement.querySelector('div[data-test="date"] input');
        const inputTime = questionElement === null || questionElement === void 0 ? void 0 : questionElement.querySelector('div[data-test="time"] input');
        const inputAmPm = questionElement === null || questionElement === void 0 ? void 0 : questionElement.querySelector('div[data-test="ampm"] input');
        if (!inputTime) {
            throw new Error(`Input or textarea was not found inside ${`[data-linkid=${linkId}] block`}`);
        }
        if (!inputDate) {
            throw new Error(`Input or textarea was not found inside ${`[data-linkid=${linkId}] block`}`);
        }
        if (!inputAmPm) {
            throw new Error(`Input or textarea was not found inside ${`[data-linkid=${linkId}] block`}`);
        }
        fireEvent.change(inputDate, { target: { value: date } });
        fireEvent.change(inputTime, { target: { value: time } });
        fireEvent.change(inputAmPm, { target: { value: amPm } });
        // Here we await for debounced store update
        yield new Promise((resolve) => setTimeout(resolve, 500));
    });
}
export function checkRadioOption(canvasElement, linkId, text) {
    return __awaiter(this, void 0, void 0, function* () {
        const questionElement = yield findByLinkId(canvasElement, linkId);
        const radio = questionElement === null || questionElement === void 0 ? void 0 : questionElement.querySelector(`span[data-test="radio-single-${text}"] input`);
        if (!radio) {
            throw new Error(`Input or textarea was not found inside ${`[data-linkid=${linkId}] block`}`);
        }
        fireEvent.click(radio);
        // Here we await for debounced store update
        yield new Promise((resolve) => setTimeout(resolve, 500));
    });
}
export function getInputText(canvasElement, linkId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const questionElement = yield findByLinkId(canvasElement, linkId);
        const input = (_a = questionElement === null || questionElement === void 0 ? void 0 : questionElement.querySelector('input')) !== null && _a !== void 0 ? _a : questionElement === null || questionElement === void 0 ? void 0 : questionElement.querySelector('textarea');
        if (!input) {
            throw new Error(`Input or textarea was not found inside ${`[data-linkid=${linkId}] block`}`);
        }
        return input.value;
    });
}
export function chooseSelectOption(canvasElement, linkId, optionLabel) {
    return __awaiter(this, void 0, void 0, function* () {
        const questionElement = yield findByLinkId(canvasElement, linkId);
        const input = questionElement.querySelector('input, textarea');
        if (!input) {
            throw new Error(`There is no input inside ${linkId}`);
        }
        fireEvent.focus(input);
        fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' });
        const option = yield screen.findByText(optionLabel);
        fireEvent.click(option);
    });
}
export function chooseQuantityOption(canvasElement, linkId, quantity, quantityComparator) {
    return __awaiter(this, void 0, void 0, function* () {
        const questionElement = yield findByLinkId(canvasElement, linkId);
        const inputComaparator = questionElement.querySelector('div[data-test=""q-item-quantity-comparator""] input');
        const inputWeight = questionElement.querySelector('div[data-test="q-item-quantity-field"] input');
        if (!inputComaparator) {
            throw new Error(`There is no input inside ${linkId}`);
        }
        if (!inputWeight) {
            throw new Error(`There is no input inside ${linkId}`);
        }
        fireEvent.focus(inputComaparator);
        fireEvent.keyDown(inputComaparator, { key: 'ArrowDown', code: 'ArrowDown' });
        if (quantityComparator) {
            const option = yield screen.findByText(quantityComparator);
            fireEvent.click(option);
            fireEvent.change(inputComaparator, { target: { value: quantityComparator } });
        }
        fireEvent.change(inputWeight, { target: { value: quantity } });
        // Here we await for debounced store update
        yield new Promise((resolve) => setTimeout(resolve, 500));
    });
}
export function findByLinkId(canvasElement, linkId) {
    return __awaiter(this, void 0, void 0, function* () {
        const selector = `[data-linkid="${linkId}"]`;
        return yield waitFor(() => {
            const el = canvasElement.querySelector(selector);
            if (!el) {
                throw new Error(`Element ${selector} not found`);
            }
            return el;
        });
    });
}
export function inputOpenChoiceOtherText(canvasElement, linkId, text) {
    return __awaiter(this, void 0, void 0, function* () {
        const questionElement = yield findByLinkId(canvasElement, linkId);
        const textarea = questionElement === null || questionElement === void 0 ? void 0 : questionElement.querySelector('div[data-test="q-item-radio-open-label-box"] textarea');
        if (!textarea) {
            throw new Error(`Input or textarea was not found inside ${`[data-test=${linkId}] block`}`);
        }
        fireEvent.change(textarea, { target: { value: text } });
        // Here we await for debounced store update
        yield new Promise((resolve) => setTimeout(resolve, 500));
    });
}
//# sourceMappingURL=index.js.map