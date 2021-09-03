'use strict';

const getAvatarColorById = require('..');

describe('web-avatar', () => {
    it('needs tests', () => {
        const avatarColor = getAvatarColorById('d419d2b0-5c20-4dd7-9a5c-177375c249b8')
        expect(avatarColor).toEqual('#8fbfc5')
    });
});
