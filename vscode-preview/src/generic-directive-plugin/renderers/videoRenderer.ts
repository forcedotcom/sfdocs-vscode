import h = require('hastscript');

/**
 * This renderer is useful to convert 
 * 
    ::video{src="/media/videos/salesforce_tata.mp4" title="Video - local" type="local" alt="AlternateText"}

    to

    <div class="video-plugin-div">
        <div class="video-plugin-title-div">
            <h3 class="video-plugin-title" id="video-local">Video - local</h3>
        </div>
        <div class="video-plugin-container">
            <video controls="">
                <source src="/media/videos/salesforce_tata.mp4" type="video/mp4">
                <p> AlternateText </p>
            </video>
        </div>
    </div>

 * 
 * @param metadata Contains all the information need to create a new DOM
 */
 export default function transformToVideo(metadata: Map<string, string>): Map<string, string> {
        const sourceUrl = metadata.get('sourceUrl');
        const title = metadata.get('title');
        const type = metadata.get('type');
        const alt = metadata.get('alt');
        const node:any = metadata.get('node');
        const mdLineNumber = node.position.start.line;
        const domResponse = new Map<string, string>();
    
        if (type === 'youtube') {
            const outputDom = `<div class="video-container" data-line=${mdLineNumber} data-name="videoBlock">
            <div class="video-plugin-title-div">
                <div class= "video-toolbar dx-text-heading-7 dx-video-heading">${title}</div>
            </div>
            <div class="video-body">
                    <iframe src='${sourceUrl}'> 
                    </iframe>
            </div>
            </div>`;

                
    
            domResponse.set('outputDom', outputDom);
            return domResponse;
        } else if (type === 'local') {

            const outputDom = `<div class="video-container" data-line=${mdLineNumber} data-name="videoBlock">
            <div class="video-plugin-title-div">
                <div class= "video-toolbar dx-text-heading-7 dx-video-heading">${title}</div>
            </div>
            <div class="video-body">
                    <video  controls="controls" style=" width: -webkit-fill-available;">
                        <source src="${sourceUrl}" type="video/mp4">
                        <p> ${alt} </p>
                    </video>
                    </div>
            </div>`;
            domResponse.set('outputDom', outputDom);
            return domResponse;
        } else if (type === 'vidyard') {
            // TODO: download and attach the vidyard script fom doc-framework https://gus.lightning.force.com/lightning/r/ADM_Work__c/a07B0000008aH8jIAE/view

            const outputDom = `<div class="video-container" data-line=${mdLineNumber} data-name="videoBlock">
            <div class="video-plugin-title-div">
                <div class= "video-toolbar dx-text-heading-7 dx-video-heading">${title}</div>
            </div>
            <div class="video-body">
            <img  class="vidyard-player-embed"
                    src="https://play.vidyard.com/${sourceUrl}.jpg"
                    data-uuid="${sourceUrl}"
                    data-v="4"
                    data-type="inline"
                    alt="${alt}"
                    data-autoplay="0"/></div></div>`;
            domResponse.set('outputDom', outputDom);
            return domResponse;
        }
    }
