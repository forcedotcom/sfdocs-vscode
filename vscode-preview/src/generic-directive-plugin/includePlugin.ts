/**
 * Remark plugin for including external files.
 * Most of it taken from : https://github.com/Symbitic/remark-include
 */

import * as path from 'path';
import * as visit from 'unist-util-visit';
import * as fs from 'fs';
import { createLogger } from '@sfdocs-internal/logger';

/**
 * This is the regex to be matched to include a file
 * ::include {file=test.md}
 * NOTE: test.md should be part of the shared folder.
 */
const parseInclude = /^::include\s?{src="(.*md)"}(\n|$)/; // This is changed as per our requirement.

function transformer(tree: any, file: any, cwd: any, processor: { parse: (arg0: any) => any }) {
    visit(tree, ['text'], (node: any, i: any, parent: { children: any[] }) => {
        if (!parseInclude.test(node.value)) {
            return;
        }

        const [, filename] = node.value.match(parseInclude);
        try {
            const srcFilePaths = filename.split('/');
            const localefilePath = cwd.split('/guides/');
            const sharedFileName = srcFilePaths[srcFilePaths.length-1];
            const sharedfileAbsolutePath = path.join(localefilePath[0], 'shared', sharedFileName);
            if (fs.existsSync(sharedfileAbsolutePath)) {
                const vfile = fs.readFileSync(sharedfileAbsolutePath);
                const root = processor.parse(vfile);
                // Recurse
                transformer(root, vfile, cwd, processor);
                const { children } = root;
                parent.children.splice(i, 1, ...children);
            } else file.fail(`File not found ${path.resolve(cwd, filename)}`, node);
        } catch (err) {
            // Ignore catching as we are catching the error in file.fail statement above.
            const logger = createLogger({
                label: '@salesforcedocs/markdown-compiler:include-plugin',
            });
            logger.error(`IncludePlugin File not found`);
            return true;
        }
    });
}

function include(options: any) {
    // Shared folder path is mandatory otherwise we will not include any file.
    if (options && options.cwd) {
        const cwd = options.cwd; //|| process.cwd()
        return (tree: any, file: any) => {
            transformer(tree, file, cwd, this);
        };
    }
}

export { include };
