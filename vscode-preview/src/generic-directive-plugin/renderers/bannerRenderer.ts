/**
 * This renderer is useful to convert 
 * 

 ```sfdocs
<banner img="https://placekitten.com/300/300" title="My testing 111">
</banner>
```

 * to something like the below 
 * 
<dx-banner img="https://placekitten.com/300/300" title="My testing 111" img-alt="A banner" subtitle="This is the subtitle" background-color="dark-indigo" title-position="center" cta="Read more on the blog" cta-href="https://www.salesforce.com" cta-target="_blank" cta-aria-label="Salesforce button">
</dx-banner>
 * 
 * @param metadata Contains all the information need to create a new DOM
 */
export default function transform(metadata: Map<string, string>) {
    const imageUrl = metadata.get('imageUrl');
    const title = metadata.get('title');

    if (imageUrl && title) {
        const domResponse = new Map<string, string>();
        const updatedDom = `<dx-banner 
                img='${imageUrl}' 
                title='${title}' 
                img-alt="A banner" subtitle='This is the subtitle'
                background-color='dark-indigo' title-position='center' cta="Read more on the blog"
                cta-href="https://www.salesforce.com" cta-target="_blank" cta-aria-label="Salesforce button">
                </dx-banner>`;

        domResponse.set('updatedDom', updatedDom);
        domResponse.set('nodeType', 'html');

        return domResponse;
    }
}
