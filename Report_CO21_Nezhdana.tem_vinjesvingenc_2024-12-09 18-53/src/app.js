const PageStateStyle = {
    OK: "navbar-page-ok",
    WARNING: "navbar-page-warning",
    ERROR: "navbar-page-error",
    DISABLED: "navbar-page-disabled"
}

const InfoFieldsTypes = {
    Plain: 'plain',
    Multiline: 'multiline',
    MissionTags: 'missionTags',
    DynaiZones: 'dynaiZones'
}

const TagsMarkdown = {
	"SPECOPS": { 		bg: "#8ab62f", text: "whitesmoke", "tooltip": "Спец. операция силами небольшой группы спецназа" },
	"INFANTRY": {		bg: "#ba2b2b", text: "whitesmoke", "tooltip": "Пехотная операция силами стрелковых или моторизированных подразделений" },
	"COMB.ARMS": {		bg: "#596816", text: "whitesmoke", "tooltip": "Общевойсковая операция с участием разных родов войск" },
	"JTAC/CAS": { 		bg: "#6aa29e", text: "whitesmoke", "tooltip": "Операция с привлечением штурмовой авиации" },
	"ARMOR": { 			bg: "#6e8fa6", text: "whitesmoke", "tooltip": "Операция с привлечением тяжелой техники (танки, БМП)" },
	"AIRBORNE": {		bg: "#2a6c98", text: "whitesmoke", "tooltip": "Операция с привлечением транспортной авиации (десант)" },
	"MOUT": { 			bg: "#aaaaaa", text: "#ffffff",    "tooltip": "Операция в городской среде" },
	"RolePlay":  { 		bg: "#59ae42", text: "whitesmoke", "tooltip": "Миссия с ролевым элементом" },
	"EAST GEAR":  { 	bg: "#7d2e2e", text: "whitesmoke", "tooltip": "Снаряжение восточного блока (ОВД, РФ)" },
	"WEST GEAR": {      bg: "#1c358b", text: "whitesmoke", "tooltip": "Снаряжение западного блока (NATO и т.п.)" },
	"EXOTIC GEAR": {    bg: "#59ae42", text: "whitesmoke", "tooltip": "Специфическое снаряжение (60-е, 70-е)" },
	"FIX NEEDED": {		bg: "#dddd11", text: "#333333",    "tooltip": "Сломано! Пишите в СпортЛото!" },
	"default": { 		bg: "#8374aa", text: "whitesmoke", "tooltip": "" }
};

const SidesColors = {
    WEST: "#004d99",
    EAST: "#800000",
    RESISTANCE: "#008000",
    CIVILIAN: "#660080"
}

A = 0



class App {
    constructor(reviewData) {
        this.data = reviewData
        this.page = null
        this.pageId = 0

        this.$selectors = {
            navbar: {
                list: '#navbar ul',
                items: '#navbar ul li',
                activeItems: '#navbar ul li.navbar-active',
                itemByIdx: '#navbar ul li:eq(%)'
            },
            header: {
                missionName: '#header-mission-name',
                pageName: '#header-current-page',
                scrollUpBtn: '#header-btn-up'
            },
            info: {
                block: "#info",
                elements: "#info > div"
            },
            rawContent: {
                elements: "#raw-content > div",
                collapsibles: "#raw-content > div .collapsible"
            }
        }

        this.init()
    }

    init() {
        $(this.$selectors.header.scrollUpBtn).on("click", e=>{
            $("#wrapper").animate({scrollTop: 0})
        })
        $(this.$selectors.header.missionName).html(this.data.filename)

        const navbarItems =  this.data.pages.map((page, index)=> {
            const name = page.name
            const active = page.status == "DISABLED" ? "" : "navbar-active"
            const status = PageStateStyle[page.status]

            console.assert(status, `Invalid Page Status = [${status}]`)
            return (`<li class="${active} ${status}" page-id="${index}">${name}</li>`)
        })

        $(this.$selectors.navbar.list).html(navbarItems.join(''))
        $(this.$selectors.navbar.activeItems).on("click", (e)=>{
            const pageId = parseInt(e.currentTarget.attributes['page-id'].value)
            this.loadPage(pageId)
        })

        this.loadPage(0)
    }

    loadPage(idx) {
        console.assert(idx >= 0 && idx < this.data.pages.length, `Page index ${idx} is out of range`)
        const page = this.data.pages[idx]

        this.page = page
        this.pageId = idx

        this.updateNavbarState(idx)
        this.updateHeader(page)

        this.renderFields()
        this.renderFileContent()
    }

    updateNavbarState(idx) {
        $(this.$selectors.navbar.items).removeClass('navbar-selected')
        $(this.$selectors.navbar.itemByIdx.replace('%', idx)).toggleClass('navbar-selected')
    }

    updateHeader(page) {
        const pageStatus = ''
        // const pageStatus = page.status == "OK" ? '✔' : page.status == "ERROR" ? '✖' : '↯'
        $(this.$selectors.header.pageName).html(`/ ${page.name}&nbsp;&nbsp;&nbsp;${pageStatus}`)
    }

    renderFields() {
        console.log('RenderFields')
        if (this.page.info.length == 0) {
            $(this.$selectors.info.elements).html('')
            $(this.$selectors.info.block).css("display", "none")
            return
        }

        const elements = this.page.info.map(info => {
            // Normal string rendering
            console.log("Info ELements Rendering ")
            console.log(info)
            console.log(info.type)
            if (info.type == InfoFieldsTypes.Plain) {
                return ([
                    '<div class="info-line">',
                    '<div class="info-title">' + info.name + '</div>',
                    '<div class="info-value">' + info.value + '</div>',
                    '</div>'
                ]).join('')
            }

            // Array value rendering
            const elLines = [
                '<div class="info-line">',
                '<div class="info-title">', info.name, '</div>'
            ]

            console.log(info.value)
            info.value.forEach(el => {
                console.log(el)
                if (info.type == InfoFieldsTypes.MissionTags) {
                    // Formatting of tags
                    let md = TagsMarkdown[el]
                    if (!md) {
                        md = TagsMarkdown.default
                    }
                    elLines.push(
                        '<div class="info-value info-value-list tag" style="'
                        + `background-color:${md.bg};color:${md.text}`
                        + '">'
                        + `[${el}] ${md.tooltip}`
                        + '</div>'
                    )
                    return
                } 

                if (info.type == InfoFieldsTypes.DynaiZones) {
                    const name = el[0]
                    const side = el[1]
                    const isActive = el[2] == 'true'
                    const style = `background-color:${SidesColors[side]}${isActive ? 'ff' : '5c'}`

                    elLines.push(
                        '<div class="info-value info-value-list info-value-dynai-zone">'
                        + `<span style='${style}'>${name}</span>`
                        + '</div>'
                    )
                    return
                }
                
                // Simple multiline
                elLines.push('<div class="info-value info-value-list">' + el + '</div>')
            })
            elLines.push('</div>')

            return elLines.join('')
        })

        $(this.$selectors.info.elements).html(elements.join(''))
        $(this.$selectors.info.block).css("display", "unset")
    }

    renderFileContent() {
        if (!this.page.rawContent) {
            $(this.$selectors.rawContent.elements).html('')
            $(this.$selectors.rawContent.elements).css("display", "none")
            return
        }

        const elements = this.page.rawContent.map(raw => {
            const header = raw.filename
            let renderedContent = ''
            if (raw.language == 'image') {
                renderedContent = '<img src="' + raw.content + '"/>'
            } else {
                renderedContent = hljs.lineNumbersValue(
                    hljs.highlight(raw.content, {language: raw.language}).value
                )
            }

            return ([
                `<button class='collapsible'>${header}</button>`,
                '<div id="raw-content-line" class="content"><pre><code>',
                renderedContent,
                '</pre></code></div>'
            ]).join("")
        })

        $(this.$selectors.rawContent.elements).html(elements.join(""))
        $(this.$selectors.rawContent.elements).css("display", null)

        $(this.$selectors.rawContent.collapsibles).on('click', (e)=>{
            e.currentTarget.classList.toggle('collapsible-active')
            const content = e.currentTarget.nextElementSibling;
            content.style.maxHeight = content.style.maxHeight ? null : `${content.scrollHeight}px`;
        })
    }
}


$( document ).ready(function () {
	console.log("KEK Ready");

    hljs.initLineNumbersOnLoad({
        singleLine: true
    });

	$("#header-btn-up").hide()
	$('#wrapper').on("scroll", (e)=>{
		const scrollPos = document.querySelector("#wrapper").scrollTop
		if (scrollPos < 200) {
			$("#header-btn-up").hide()
		} else {
			$("#header-btn-up").show()
		}
	})

    ReviewApp = new App(MissionReviewData);
})


// https://highlightjs.org/#usage
/*
const highlightedCode = hljs.highlight(
  '<span>Hello World!</span>',
  { language: 'xml' }
).value
*/

/*
class Issue {
    constructor(obj) {
        this.id = obj.id
        this.name = obj.name
        this.type = obj.type
        this.format = obj.format == undefined ? (name) => name : obj.format
    }

    getFormattedHTML(args) {
        const title = this.format(this.name, args)
        let cssClass = 'issue-warning'
        let icon = '⚠'
        if (this.type == IssueTypes.ERR) {
            let cssClass = 'issue-error'
            let icon = '✖'
        }
        return `<div class='${cssClass}><span>${icon}</span>[${this.type}-${this.id}] ${title}</div>`
    }
}
*/