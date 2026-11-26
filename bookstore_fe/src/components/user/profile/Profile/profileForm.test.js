import test from 'node:test';
import assert from 'node:assert/strict';
import { getProfileFormValues } from './profileForm.js';

test('getProfileFormValues extracts user fields with safe defaults for reset', () => {
    assert.deepEqual(
        getProfileFormValues({
            fullName: 'Nguyen Van A',
            phone: '0901234567',
            email: 'a@example.com',
        }),
        {
            fullName: 'Nguyen Van A',
            phone: '0901234567',
            email: 'a@example.com',
        },
    );

    assert.deepEqual(getProfileFormValues({ fullName: '', phone: null, email: undefined }), {
        fullName: '',
        phone: '',
        email: '',
    });

    assert.deepEqual(getProfileFormValues(null), {
        fullName: '',
        phone: '',
        email: '',
    });
});
