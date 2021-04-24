// Partly taken (inspired :-) ) by remark-hint package
// https://github.com/sergioramos/remark-hint

import * as u from 'unist-builder';

const classNames = {
    'admonition-tip': /^TIP/,
    'admonition-warning': /^WARNING/,
    'admonition-caution': /^CAUTION/,
};

// from github.com/syntax-tree/unist-util-map/blob/bb0567f651517b2d521af711d7376475b3d8446a/index.js
const map = (tree, iteratee) => {
    const preorder = (node, index, parent) => {
        const newNode = iteratee(node, index, parent);

        if (Array.isArray(newNode.children)) {
            newNode.children = newNode.children.map((child, index) => {
                return preorder(child, index, node);
            });
        }

        return newNode;
    };

    return preorder(tree, null, null);
};

export default () => (tree) => {
    return map(tree, (node) => {
        const { children = [] } = node;
        if (node.type !== 'blockquote') {
            return node;
        }

        if (
            !(
                children[0].children[0] &&
                children[0].children[0].value &&
                Object.values(classNames).some((r) => r.test(children[0].children[0].value.trim()))
            )
        ) {
            return node;
        }

        const [className, r] = Object.entries(classNames).find(([, r]) => {
            return r.test(children[0].children[0].value);
        });

        let siblings = children;
        // As the block initial TIP/WARNING is in the children value - replace it with blank.
        children[0].children[0].value = children[0].children[0].value.replace(r, '');
        siblings = children;

        const props = {
            data: {
                class: className,
                hProperties: {
                    class: className,
                    keyword: 'caution',
                    emoji: '⚠️', // '&#x26A0;&#xFE0F;'
                },
            },
        };
        const returnNode = u('blockquote', props, [/*newChild, */ ...siblings]);
        return returnNode;
    });
};
