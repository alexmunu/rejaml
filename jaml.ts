
    export class Node {
        tagName: string;
        attributes: Object;
        children: any[];
        notSelfClosingTags: string[] = ['textarea', 'script', 'em', 'strong', 'option', 'select']

        constructor(tagName: string) {
            this.tagName = tagName;
            this.attributes = {};
            this.children = [];
        }

        setAttributes(attrs: Object) {
            for (var key in attrs) {
                //convert cls to class
                var mappedKey = key == 'cls' ? 'class' : key;

                this.attributes[mappedKey] = attrs[key];
            }
        }

        addChild(childText: string) {
            this.children.push(childText);
        }

        render(lpad: number): string {
            lpad = lpad || 0;

            var node: string[] = [],
                attrs = [],
                textnode = (this instanceof TextNode),
                multiline = this.multiLineTag();


            //add any left padding
            if (!textnode) node.push(this.getPadding(lpad));

            //open the tag
            node.push("<" + this.tagName);

            for (var key in this.attributes) {
                attrs.push(key + "=\"" + this.attributes[key] + "\"");
            }
            attrs.sort()
            //add any tag attributes
            for (var i = 0; i < attrs.length; i++) {
                node.push(" " + attrs[i]);
            }

            if (this.isSelfClosing() && this.children.length == 0) {
                node.push("/>\n");
            } else {
                node.push(">");

                if (multiline) node.push("\n");

                this.renderChildren(node, this.children, lpad);

                if (multiline) node.push(this.getPadding(lpad));
                node.push("</", this.tagName, ">\n");
            }

            return node.join("");
        }

        renderChildren(node: string[], children: any[], lpad: number) {
            var childlpad = lpad + 2;

            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                if (child instanceof Array) {
                    var nestedChildren = child;
                    this.renderChildren(node, nestedChildren, lpad)
                } else {
                    node.push(child.render(childlpad));
                }
            }
        }

        multiLineTag(): boolean {
            var childLength = this.children.length,
                multiLine = childLength > 0;

            if (childLength == 1 && this.children[0] instanceof TextNode) multiLine = false;

            return multiLine;
        }

        getPadding(amount: number): string {
            return new Array(amount + 1).join(" ");
        }

        isSelfClosing(): boolean {
            for (var i = this.notSelfClosingTags.length - 1; i >= 0; i--) {
                if (this.tagName == this.notSelfClosingTags[i]) return false;
            }

            return true;
        }
    }

    export class TextNode {
        text: string;
        constructor(text: string) {
            this.text = text;
        }

        render(): string {
            return this.text;
        }
    }


    export class Template {
        tpl: any;
        nodes: any[];

        tags: any[] = [
            "html", "head", "body", "script", "meta", "title", "link",
            "div", "p", "span", "a", "img", "br", "hr", "em", "strong",
            "table", "tr", "th", "td", "thead", "tbody", "tfoot",
            "ul", "ol", "li",
            "dl", "dt", "dd",
            "h1", "h2", "h3", "h4", "h5", "h6", "h7",
            "form", "fieldset", "input", "textarea", "label", "select", "option"
        ];

        constructor(tpl) {
            this.tpl = tpl;
            for (var i = 0, tag; tag = this.tags[i]; i++) {
                this.tags[tag] = this.makeTagHelper(tag);
            };
        }

        render(thisObj?: Object, data?: string[]): string {
            for (var i = 0; i < data.length; i++) {
                eval("(" + this.tpl.toString() + ").call(thisObj, data[i], i)");
            };

            var roots = this.getRoots(),
                output = "";

            for (var i = 0; i < roots.length; i++) {
                output += roots[i].render();
            }

            return "";
        }

        getRoots() {
            var roots = [];
            for (var i = 0; this.nodes.length; i++) {
                var node = this.nodes[i];

                if (node.parent == undefined) roots.push(node);
            }
            return roots;
        }

        makeTagHelper(tagName) {
            return function (attrs) {
                var node = new Node(tagName);

                var firstArgIsAttributes = (typeof attrs == 'object')
                    && !(attrs instanceof Node)
                    && !(attrs instanceof TextNode);

                if (firstArgIsAttributes) node.setAttributes(attrs);
                var startIndex = firstArgIsAttributes ? 1 : 0;

                for (var i = startIndex; i < arguments.length; i++) {
                    var arg = arguments[i];

                    if (typeof arg == "string" || arg == undefined) {
                        arg = new TextNode(arg || "");
                    }

                    if (arg instanceof Node || arg instanceof TextNode) {
                        arg.parent = node;
                    }

                    node.addChild(arg);
                }

                this.nodes.push(node);

                return node;
            }
        }
    }



export class Jaml{

    templates:Template;

    register(name:string,templates:Template){
        this.templates=templates;
    }

    render(name:string,thisObj?:Object,data?:Object){
        var template=this.templates,renderer=new Template(template);

        return renderer.render.apply(renderer,Array.prototype.slice.call(arguments,1));
    }
}
