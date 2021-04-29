/**
 * This renderer is useful to convert 
 * 
  ```sfdocs-code {"title" : "Java: Local code block", "lang":"java"}
    public static void main(String args[])
    {
        // Hello world in comment
        System.out.println("Hello world!");
    }
  ```
 * to something like the below 
 * 
<dx-code-block language="java" title="Java: Local code block" code-block="<pre class=&quot;codeblock brush:apex&quot;>    public static void main(String args[])
    {
        // Hello world in comment
        System.out.println(&quot;Hello world!&quot;);

        // New line above and a comment
        System.out.println(&quot;Bye world!&quot;);
    }</pre>"> 
</dx-code-block>
 * 
 * @param metadata Contains all the information need to create a new DOM
 */
export default function transform(metadata: Map<string, string>) {
    let lang = '';
    let title = '';

    const urlEncodedText = metadata.get('urlEncodedText');
    if (metadata) {
        lang = metadata.get('lang') ? metadata.get('lang') : 'textile';
        title = metadata.get('title') ? metadata.get('title') : '';
    }

    if (urlEncodedText) {
        const domResponse = new Map<string, string>();

        var NEW_LINE_EXP = /\n(?!$)/g;
        var lineNumbersWrapper;
        var match = urlEncodedText.match(NEW_LINE_EXP);
        var linesNum = match ? match.length + 1 : 1;
        var lines = new Array(linesNum + 1).join('<span></span>');

        lineNumbersWrapper = `<span aria-hidden="true" class="line-numbers-rows">${lines}</span>`;

        const updatedDom = `<div class="code-parent-container code-line" data-line=${metadata.get('mdLineNumber')} data-name="codeBlock">
        <div class="code-toolbar dx-theme-dark dx-variant-card">
            <div class="codeblock brush:apex line-numbers language-${lang}">
                <pre class="language-${lang}" style="min-height: 40px">${urlEncodedText}</pre>
                ${lineNumbersWrapper}
            </div>
            <div class="toolbar">
                <div class="dx-text-heading-8 dx-code-block-heading">${title}</div>
            </div>
        </div>
        </div>`
        domResponse.set('updatedDom', updatedDom);
        domResponse.set('nodeType', 'html');
        domResponse.set('nodeLang', lang);

        return domResponse;
    }
}
