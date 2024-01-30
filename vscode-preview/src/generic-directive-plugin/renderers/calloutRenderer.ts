
const types = {
    // base types
    note: {
      ifmClass: "secondary",
      keyword: "Note",
      emoji: "ℹ️", // '&#x2139;'
      svg:
        '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="16" viewBox="0 0 14 16"><path fill-rule="evenodd" d="M6.3 5.69a.942.942 0 0 1-.28-.7c0-.28.09-.52.28-.7.19-.18.42-.28.7-.28.28 0 .52.09.7.28.18.19.28.42.28.7 0 .28-.09.52-.28.7a1 1 0 0 1-.7.3c-.28 0-.52-.11-.7-.3zM8 7.99c-.02-.25-.11-.48-.31-.69-.2-.19-.42-.3-.69-.31H6c-.27.02-.48.13-.69.31-.2.2-.3.44-.31.69h1v3c.02.27.11.5.31.69.2.2.42.31.69.31h1c.27 0 .48-.11.69-.31.2-.19.3-.42.31-.69H8V7.98v.01zM7 2.3c-3.14 0-5.7 2.54-5.7 5.68 0 3.14 2.56 5.7 5.7 5.7s5.7-2.55 5.7-5.7c0-3.15-2.56-5.69-5.7-5.69v.01zM7 .98c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.12-7-7 3.14-7 7-7z"/></svg>'
    },
    tip: {
      ifmClass: "success",
      keyword: "Tip",
      emoji: "💡", //'&#x1F4A1;'
      svg:
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52" id="success"><path d="M26 2C12.7 2 2 12.7 2 26s10.7 24 24 24 24-10.7 24-24S39.3 2 26 2zm13.4 18L24.1 35.5c-.6.6-1.6.6-2.2 0L13.5 27c-.6-.6-.6-1.6 0-2.2l2.2-2.2c.6-.6 1.6-.6 2.2 0l4.4 4.5c.4.4 1.1.4 1.5 0L35 15.5c.6-.6 1.6-.6 2.2 0l2.2 2.2c.7.6.7 1.6 0 2.3z"></path></svg>'
    },
    warning: {
      ifmClass: "danger",
      keyword: "Warning",
      emoji: "🔥", //'&#x1F525;'
      svg:
        '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve"> <g> <g> <path d="M507.494,426.066L282.864,53.537c-5.677-9.415-15.87-15.172-26.865-15.172c-10.995,0-21.188,5.756-26.865,15.172 L4.506,426.066c-5.842,9.689-6.015,21.774-0.451,31.625c5.564,9.852,16.001,15.944,27.315,15.944h449.259 c11.314,0,21.751-6.093,27.315-15.944C513.508,447.839,513.336,435.755,507.494,426.066z M256.167,167.227 c12.901,0,23.817,7.278,23.817,20.178c0,39.363-4.631,95.929-4.631,135.292c0,10.255-11.247,14.554-19.186,14.554 c-10.584,0-19.516-4.3-19.516-14.554c0-39.363-4.63-95.929-4.63-135.292C232.021,174.505,242.605,167.227,256.167,167.227z M256.498,411.018c-14.554,0-25.471-11.908-25.471-25.47c0-13.893,10.916-25.47,25.471-25.47c13.562,0,25.14,11.577,25.14,25.47 C281.638,399.11,270.06,411.018,256.498,411.018z"/> </g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> </svg>'
    },
    important: {
      ifmClass: "important",
      keyword: "Important",
      emoji: "📢" ,//'&#x1f4e2;'
      svg:'<svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 52 52" id="announcement"><path d="M22.7 45.4l-1.3-1c-1.4-1-1.4-3-1.4-4v-2.9c0-.8-.7-1.5-1.5-1.5h-6c-.8 0-1.5.7-1.5 1.5v7.7c0 2.7 1.6 4.8 4.1 4.8H20c2.9 0 3.1-2 3.1-2s.5-1.8-.4-2.6zM45 18V4.4v-.1c0-2.4-3-3.1-4.6-1.5l-8.9 8.4c-1.4 1.2-3.2 1.7-5 1.7H11.3C6.1 13 2 17.5 2 22.7v.2c0 5.2 4.1 9.1 9.3 9.1h15.2c1.9 0 3.7.8 5.1 2l8.8 8.6c1.6 1.6 4.6 1 4.6-1.4V27.6c3 0 4.8-2.1 4.8-4.8 0-2.7-1.8-4.8-4.8-4.8z"></path></svg>'
    }
  };
/**
 * This renderer is useful to convert
 *
    :::tip
        First line of tip text
    :::
 *
 * @param metadata Contains all the information need to create a new DOM
 */
  export default function calloutTransform(metadata: Map<string, string>): Map<string, string> {
        const calloutType = metadata.get('calloutType').toLowerCase();
        const calloutTitle = metadata.get('calloutTitle');
        const node:any = metadata.get('node');
        const mdLineNumber = node.position.start.line;
        const inputDom = metadata.get('inputDom');
        if (calloutType) {
          const domResponse = new Map<string, string>();
          const typeDetails = types[calloutType];
          let outputDom = `<div>${inputDom}</div>`
          if (typeDetails) {
            outputDom = `<div class="admonition-parent-container admonition admonition-${calloutType} alert alert--secondary code-line" data-line=${mdLineNumber}>
                  <div class="admonition-heading">
                      <h5>
                          <span class="admonition-icon">${typeDetails.svg}</span>
                          ${calloutTitle}
                      </h5>
                  </div>
                  <div class="admonition-content">${inputDom}</div>
                  </div>`;
          }
          domResponse.set('outputDom', outputDom);
          return domResponse;
        }
    }
