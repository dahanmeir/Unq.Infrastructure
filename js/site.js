$.validator.addMethod("datetimeformat",
    function (value, element, parameters)
    {
        var format = $(element).attr("data-val-datetimeformat-format");
        return moment(value, format).isValid();
    });

$.validator.unobtrusive.adapters.add("datetimeformat", [], function (options)
{
    options.rules.datetimeformat = {};
    options.messages["datetimeformat"] = options.message;
});

$.validator.addMethod("queryvalidator",
    function (value, element, parameters)
    {
        var sade = $(element).attr("data-val-queryvalidator-sade");
        var type = $(element).attr("data-val-queryvalidator-type");
        var result = false;
        if ($(element).css("visibility") != "hidden")
        {
            if (type == "zero" && (value == "0" || value == ""))
            {
                result = true;
            }
            else
            {
                jQuery.ajax({
                    url: "/UnqApi/QueryLabel?sade=" + encodeURIComponent(sade) + "&key=" + encodeURIComponent(value) + "&parameters=" + encodeURIComponent(unq.query.getProperties($(element))),
                    success: function (data)
                    {
                        result = data != null && data.length > 0;
                    },
                    async: false
                });
            }
        }
        return result;
    });

$.validator.unobtrusive.adapters.add("queryvalidator", [], function (options)
{
    options.rules.queryvalidator = {};
    options.messages["queryvalidator"] = options.message;
});

$.validator.addMethod("checkbox",
        function (value, element, parameters)
        {
            return element.checked;
        });


$.validator.unobtrusive.adapters.add("checkbox", [], function (options)
{
    options.rules.checkbox = {};
    options.messages["checkbox"] = options.message;
});

var unq = {};

$(function ()
{
    var popup = unq.util.getQueryString("popup") != null;
    if (popup === false)
    {
        unq.aside.init();
        unq.menu.init();
    }

    unq.grid.init();
    unq.popup.init();
    unq.query.init();
    unq.mask.init();
});

unq.aside = {
    init: function ()
    {
        $(window).resize(function ()
        {
            $('aside').height($(window).height() - $('aside').offset().top - 55);
        });
        $(window).resize();
    }
};

unq.menu = {
    init: function ()
    {
        $('#topMenu').on('click', function (event)
        {
            $.cookie('menu_location', 'top');

            $('#wrap').removeClass('vertical-layout');
            $('#wrap').addClass('horyzontal-layout');
            $('.mainFrame').removeClass('special-container');
            $('.footerText').removeClass('moved');
            $('aside').hide();
            $('topMenu').show();
        });

        $('#rightMenu').on('click', function (event)
        {
            $.cookie('menu_location', 'right');

            $('#wrap').removeClass('horyzontal-layout');
            $('#wrap').addClass('vertical-layout');
            $('.mainFrame').addClass('special-container');
            $('.footerText').addClass('moved');
            $('aside').show();
            $('topMenu').hide();

        });

        if ($.cookie('menu_location') === 'right')
            $('#rightMenu').click();
        else
            $('#topMenu').click();
    }
};

unq.popup = {
    init: function ()
    {
        $('a[data-popup]').unbind("click").click(function ()
        {
            var url = $(this).attr("href");
            var title = $(this).attr("title");
            var width = $(this).attr("data-popup-width");
            var height = $(this).attr("data-popup-height");

            unq.popup.show(url, title, width, height);

            return false;
        });

        $(".button-close-refresh").unbind("click").click(function ()
        {
            unq.popup.close(true);
        });
        $(".button-close").unbind("click").click(function ()
        {
            unq.popup.close(false);
        });
    },

    show: function (url, title, width, height, parentPopupOfParent)
    {
        var id = "popup_" + (new Date().getTime());
        if (parentPopupOfParent == null)
        {
            var parentPopup = unq.util.getQueryString("popup");
        }
        else
        {
            var parentPopup = unq.util.getQueryString("parentPopup");
        }
        var parentPopup = unq.util.getQueryString("popup");
        url += url.indexOf("?") === -1 ? "?" : "&";
        url += "popup=" + id + "&parentPopup=" + (parentPopup != null ? parentPopup : "")
        var body = window.parent.$("body");
        body.append("<div id='" + id + "' class='k-rtl'></div>");

        body.find("#" + id).kendoWindow({
            modal: true,
            width: width + "px",
            height: height + "px",
            title: title,
            visible: false,
            iframe: true,
            content: url,
            actions: ["Close"],
            //actions: [],
            //close: unq.popup.windowClose,
        });
        //body.find(".k-window-titlebar").append("<button type='button' class='button-close pull-left' onclick='unq.popup.close()' ><span class='glyphicon glyphicon-remove'></span></button>");
        body.find("#" + id).data("kendoWindow").center().open();
    },

    close: function (refresh_window)
    {
        var id = unq.util.getQueryString("popup");
        var body = window.parent.$("body");
        body.find("#" + id).data("kendoWindow").close();
        var parentPopup = unq.util.getQueryString("parentPopup");
        if (parentPopup != null && parentPopup.length > 0)
        {
            var body = window.parent.$("body");
            body.find("#" + parentPopup).data("kendoWindow").refresh();
        }
        else
        {
            if (refresh_window == true)
            {
                window.parent.location.reload();
            }
        }
    }
};

unq.grid = {
    init: function ()
    {
        //set culture
        kendo.culture("he-IL");

        //set messages additional to kendo-global-master
        kendo.ui.Grid.prototype.options.messages =
           $.extend(kendo.ui.Grid.prototype.options.messages, {
               noRecords: "לא נמצאו נתונים."
           });
    },

    onDataBound: function (args)
    {
        unq.popup.init();
        
        //hide paging for 1 page
        if (this.dataSource.total() > this.dataSource.pageSize())
        {
            this.pager.element.show();
        }

        //fix grid height no scroll
        try
        {
            var grid = args.sender.element;
            var gridContent = grid.find(".k-grid-content");
            var gridContentHeight = gridContent.find("> table")[0].scrollHeight;
            gridContent.height(gridContentHeight).css("overflow", "auto");
            grid.height("auto");
        } catch (e) { }
    },

    queryFormat: function (data, propertyName, sug)
    {
        var key = data[propertyName];
        if (sug == 6)
        {
            key = key.toString();
            return key[6] + key[7] + "/" + key[4] + key[5] + "/" + key[0] + key[1] + key[2] + key[3];
        }
        if (sug == 7)
        {
            key = key.toString();
            return key[4] + key[5] + "." + key[0] + key[1] + key[2] + key[3];
        }
        else
        {
            var label = data[propertyName + "_LABEL"];
            if (label)
                return key + " - " + label;
            else
                return key;
        }
    }
};

unq.query = {
    init: function ()
    {
        $(document).on("click", '.input-group-addon', function ()
        {
            var input = $(this).parent().children().first();
            unq.query.showPopup($(input));
        });

        $("input[data-query]:not(:hidden)")
        .keydown(function (e)
        {
            var key = e.keyCode;
            if (key === 120)
            {
                //f9
                e.preventDefault();
                unq.query.showPopup($(this));
            }
            else if (key === 9)
            {
                //tab
                //e.preventDefault();
                unq.query.getLabel($(this));
            }
        }).each(function ()
        {
            $(this).attr('size', 8);
            var label = $(this).attr("data-query-label");
            $(this).wrap("<div class='input-group'></div>");
            $(this).after("<span class='input-group-addon'><span class='glyphicon glyphicon-filter'></span></span>");
            $(this).closest(".form-group").find(".input-group").after("<span class='query-label row'>" + label + "</span>");
        })
            .after("");
    },

    getLabel: function (el)
    {
        var sade = el.attr("data-query");
        var key = el.val();

        $.get("/UnqApi/QueryLabel?sade=" + encodeURIComponent(sade) + "&key=" + encodeURIComponent(key) + "&parameters=" + encodeURIComponent(unq.query.getProperties(el)))
            .success(function (data)
            {
                console.log(data);
                el.closest(".form-group").find(".query-label").text(data);
            }).error(function (a, b, c)
            {
                console.log({
                    a: a, b: b, c: c
                });
            });
    },

    showPopup: function (el)
    {
        var sade = el.attr("data-query");

        $.get("/UnqApi/Query?sade=" + encodeURIComponent(sade) + "&parameters=" + encodeURIComponent(unq.query.getProperties(el)))
            .success(function (data)
            {
                var myType = '';
                var fields = {
                };
                var columns = [];
                var items = [];
                if (data.Headers.length > 0)
                {
                    for (i = 0; i < data.Headers.length; i++)
                    {
                        myType = (typeof (data.Headers[i]) == "double" ? "number" : typeof (data.Headers[i])); // 'number' is valid type for Kendo Grid schema
                        fields["col" + i] = {
                            type: myType
                        };

                        columns.push({
                            field: "col" + i, title: data.Headers[i]
                        });
                    }
                };

                for (var i = 0; i < data.Data.length; i++)
                {
                    var item = {
                    };
                    for (var k = 0; k < data.Data[i].Items.length; k++)
                    {
                        item["col" + k] = data.Data[i].Items[k];
                    }
                    items.push(item);
                }

                //create popup and grid for each f9 click
                var id = "query_popup_" + (new Date().getTime());

                var body = window.parent.$("body");
                body.append("<div id='" + id + "' class='k-rtl'><div class='queryGrid'></div></div>");

                body.find("#" + id).kendoWindow({
                    modal: true,
                    width: "600px",
                    height: "540px",
                    title: "בחירת ערך",
                    visible: false,
                    iframe: false,
                    content: "",
                    actions: ["Close"]
                });

                body.find("#" + id).data("kendoWindow").center().open();

                body.find("#" + id).find(".queryGrid").kendoGrid({
                    dataSource: {
                        data: items,
                        schema: {
                            model: { fields: fields }
                        },
                        pageSize: 10,
                    },
                    selectable: true,
                    change: function ()
                    {
                        var alldata = body.find("#" + id).find(".queryGrid").data("kendoGrid");
                        var selectedItem = alldata.dataItem(this.select());
                        unq.query.selected(el, selectedItem, id);
                    },
                    //scrollable: true,
                    sortable: true,
                    filterable: true,
                    pageable: {
                        refresh: true,
                        pageSizes: false,
                        buttonCount: 5
                    },
                    //pageable: { input: true, numeric: false },
                    columns: columns,
                    height: 500,
                    //scrollHeight: 500,
                    dataBound: unq.grid.onDataBound,
                });
            });
    },

    selected: function (el, selectedItem, id)
    {
        el.val(selectedItem.col0);
        $(el).valid();
        if (selectedItem.col2 != null)
            el.closest(".input-group").next(".query-label").text(selectedItem.col2);
        else
            el.closest(".input-group").next(".query-label").text(selectedItem.col1);
        var body = window.parent.$("body");
        body.find("#" + id).data("kendoWindow").close();
    },

    getProperties: function (el)
    {
        var properties = {
        };
        var names = el.attr("data-query-properties").split(',');
        var func = el.attr("data-query-function");

        //get from function
        if (func != "" && func != undefined)
            properties = eval(func);

        //get from form
        for (var i = 0; i < names.length; i++)
        {
            var element = $("#" + names[i]);
            if (element.length > 0)
                properties[names[i]] = element.val();
        }

        var results = [];
        for (var property in properties)
        {
            results.push(property + "=" + properties[property]);
        }

        return results.join(',');
    }
};

unq.mask = {
    init: function ()
    {
        $("input[data-mask]").each(function ()
        {
            var mask = $(this).attr("data-mask-properties");
            $(this).inputmask(mask, {
                "placeholder": mask
            });
        });
    }
};


unq.util = {
    getQueryString: function (name, url)
    {
        if (!url)
        {
            url = window.location.href;
        }
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
};