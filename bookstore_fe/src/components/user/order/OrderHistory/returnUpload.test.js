import test from 'node:test';
import assert from 'node:assert/strict';
import {
    MAX_EVIDENCE_FILE_BYTES,
    validateEvidenceFile,
    shouldCompressImage,
} from './returnUpload.js';

test('validateEvidenceFile rejects missing or non-image files', () => {
    assert.equal(validateEvidenceFile(null).valid, false);
    const pdfResult = validateEvidenceFile({ name: 'doc.pdf', type: 'application/pdf', size: 1024 });
    assert.equal(pdfResult.valid, false);
    assert.match(pdfResult.error, /ảnh/i);
});

test('validateEvidenceFile rejects files exceeding hard limit', () => {
    const oversized = {
        name: 'huge.jpg',
        type: 'image/jpeg',
        size: MAX_EVIDENCE_FILE_BYTES + 1,
    };
    const result = validateEvidenceFile(oversized);
    assert.equal(result.valid, false);
    assert.match(result.error, /MB/);
});

test('validateEvidenceFile accepts valid images and flags large images for compression', () => {
    const smallImg = { name: 'small.png', type: 'image/png', size: 200 * 1024 };
    const largeImg = { name: 'camera.jpg', type: 'image/jpeg', size: 4 * 1024 * 1024 };
    const gifImg = { name: 'anim.gif', type: 'image/gif', size: 2 * 1024 * 1024 };

    assert.equal(validateEvidenceFile(smallImg).valid, true);
    assert.equal(validateEvidenceFile(largeImg).valid, true);
    assert.equal(shouldCompressImage(smallImg), false);
    assert.equal(shouldCompressImage(largeImg), true);
    assert.equal(shouldCompressImage(gifImg), false);
});
