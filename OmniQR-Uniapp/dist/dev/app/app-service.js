if (typeof Promise !== "undefined" && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor;
    return this.then(
      (value) => promise.resolve(callback()).then(() => value),
      (reason) => promise.resolve(callback()).then(() => {
        throw reason;
      })
    );
  };
}
;
if (typeof uni !== "undefined" && uni && uni.requireGlobal) {
  const global = uni.requireGlobal();
  ArrayBuffer = global.ArrayBuffer;
  Int8Array = global.Int8Array;
  Uint8Array = global.Uint8Array;
  Uint8ClampedArray = global.Uint8ClampedArray;
  Int16Array = global.Int16Array;
  Uint16Array = global.Uint16Array;
  Int32Array = global.Int32Array;
  Uint32Array = global.Uint32Array;
  Float32Array = global.Float32Array;
  Float64Array = global.Float64Array;
  BigInt64Array = global.BigInt64Array;
  BigUint64Array = global.BigUint64Array;
}
;
if (uni.restoreGlobal) {
  uni.restoreGlobal(Vue, weex, plus, setTimeout, clearTimeout, setInterval, clearInterval);
}
(function(vue) {
  "use strict";
  const STORAGE_KEY = "omniqr_records";
  const now = () => Date.now();
  const seedRecords = [
    {
      id: "seed-wifi",
      title: "门店WiFi",
      type: "WiFi",
      content: "WIFI:T:WPA;S:OmniQR;P:12345678;H:false;;",
      desc: "WIFI:T:WPA;S:OmniQR...",
      favorite: true,
      source: "generated",
      createdAt: now() - 1e3 * 60 * 10,
      updatedAt: now() - 1e3 * 60 * 10
    },
    {
      id: "seed-contact",
      title: "个人名片",
      type: "名片",
      content: "BEGIN:VCARD\nVERSION:3.0\nFN:OmniQR\nEND:VCARD",
      desc: "BEGIN:VCARD...",
      favorite: true,
      source: "generated",
      createdAt: now() - 1e3 * 60 * 60,
      updatedAt: now() - 1e3 * 60 * 60
    },
    {
      id: "seed-link",
      title: "项目链接",
      type: "链接",
      content: "https://example.com",
      desc: "https://example.com",
      favorite: false,
      source: "generated",
      createdAt: now() - 1e3 * 60 * 60 * 2,
      updatedAt: now() - 1e3 * 60 * 60 * 2
    }
  ];
  function listRecords() {
    const records = uni.getStorageSync(STORAGE_KEY);
    if (Array.isArray(records)) {
      return records;
    }
    uni.setStorageSync(STORAGE_KEY, seedRecords);
    return seedRecords;
  }
  function addRecord(record) {
    const records = listRecords();
    const nextRecord = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      favorite: false,
      source: "generated",
      createdAt: now(),
      updatedAt: now(),
      ...record
    };
    uni.setStorageSync(STORAGE_KEY, [nextRecord, ...records]);
    return nextRecord;
  }
  function toggleFavorite(id) {
    const records = listRecords().map((record) => {
      if (record.id !== id) {
        return record;
      }
      return {
        ...record,
        favorite: !record.favorite,
        updatedAt: now()
      };
    });
    uni.setStorageSync(STORAGE_KEY, records);
    return records;
  }
  const _sfc_main$6 = {
    data() {
      return {
        safeTop: 48,
        primaryTools: [
          {
            title: "扫码",
            icon: "/static/icons/scan.webp",
            action: "scan"
          },
          {
            title: "二维码生成",
            icon: "/static/icons/generate.webp",
            path: "/pages/generate/generate"
          },
          {
            title: "WiFi二维码",
            icon: "/static/icons/wifi.webp",
            path: "/pages/wifi/wifi"
          },
          {
            title: "名片二维码",
            icon: "/static/icons/contact.webp",
            path: "/pages/contact/contact"
          }
        ],
        records: []
      };
    },
    onLoad() {
      this.safeTop = this.getSafeTop();
    },
    onShow() {
      this.records = listRecords().slice(0, 3).map(this.formatRecord);
    },
    methods: {
      getSafeTop() {
        const info = uni.getSystemInfoSync();
        return (info.statusBarHeight || 24) + 18;
      },
      handleTool(tool) {
        if (tool.action === "scan") {
          this.scanCode();
          return;
        }
        if (tool.path === "/pages/generate/generate") {
          this.goTab(tool.path);
          return;
        }
        this.navigateTo(tool.path);
      },
      goTab(url) {
        uni.reLaunch({
          url
        });
      },
      navigateTo(url) {
        uni.navigateTo({
          url
        });
      },
      scanCode() {
        uni.scanCode({
          success: (res) => {
            uni.setStorageSync("omniqr_pending_generate_content", res.result || "");
            uni.setStorageSync("omniqr_pending_generate_source", "scan");
            uni.reLaunch({
              url: "/pages/generate/generate"
            });
          },
          fail: () => {
            uni.showToast({
              title: "扫码暂不可用",
              icon: "none"
            });
          }
        });
      },
      showTodo(name) {
        uni.showToast({
          title: `${name}待接入`,
          icon: "none"
        });
      },
      formatRecord(record) {
        const map = {
          WiFi: {
            icon: "/static/icons/wifi.webp"
          },
          名片: {
            icon: "/static/icons/contact.webp"
          },
          链接: {
            icon: "/static/icons/generate.webp"
          },
          文本: {
            icon: "/static/icons/generate.webp"
          }
        };
        const meta = map[record.type] || map["链接"];
        return {
          ...record,
          ...meta,
          time: this.formatTime(record.createdAt)
        };
      },
      formatTime(timestamp) {
        if (!timestamp) {
          return "";
        }
        const diff = Date.now() - timestamp;
        if (diff < 1e3 * 60 * 60) {
          return "刚刚";
        }
        if (diff < 1e3 * 60 * 60 * 24) {
          const date = new Date(timestamp);
          return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
        }
        return "昨天";
      }
    }
  };
  const _imports_0$2 = "/static/brand/omniqr-icon.webp";
  const _imports_1$2 = "/static/icons/settings.webp";
  const _imports_2$1 = "/static/icons/history.webp";
  const _imports_3 = "/static/icons/star-outline.webp";
  const _imports_0$1 = "/static/icons/home.webp";
  const _imports_1$1 = "/static/icons/plus.webp";
  const _imports_2 = "/static/icons/records.webp";
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  function _sfc_render$5(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: "page",
        style: vue.normalizeStyle({ paddingTop: $data.safeTop + "px" })
      },
      [
        vue.createElementVNode("view", {
          class: "app-header",
          style: { "display": "flex", "align-items": "center", "justify-content": "space-between" }
        }, [
          vue.createElementVNode("view", {
            class: "brand-wrap",
            style: { "display": "flex", "align-items": "center", "min-width": "0" }
          }, [
            vue.createElementVNode("image", {
              class: "brand-icon",
              src: _imports_0$2,
              mode: "aspectFit",
              style: { "width": "88rpx", "height": "88rpx", "border-radius": "22rpx", "flex-shrink": "0" }
            }),
            vue.createElementVNode("view", {
              class: "brand",
              style: { "display": "flex", "flex-direction": "column", "margin-left": "18rpx", "min-width": "0" }
            }, [
              vue.createElementVNode("text", {
                class: "brand-name",
                style: { "display": "block", "font-size": "54rpx", "font-weight": "800", "line-height": "1.18", "color": "#064e4a" }
              }, "OmniQR"),
              vue.createElementVNode("text", {
                class: "brand-title",
                style: { "display": "block", "margin-top": "6rpx", "font-size": "28rpx", "line-height": "1.2", "color": "#0f172a" }
              }, "二维码工具箱")
            ])
          ]),
          vue.createElementVNode("view", {
            class: "settings-button",
            style: { "width": "72rpx", "height": "72rpx", "display": "flex", "align-items": "center", "justify-content": "center", "border-radius": "36rpx", "background": "#ffffff", "border": "1rpx solid #d7dee8" },
            onClick: _cache[0] || (_cache[0] = ($event) => $options.showTodo("设置"))
          }, [
            vue.createElementVNode("image", {
              class: "settings-icon",
              src: _imports_1$2,
              mode: "aspectFit",
              style: { "width": "42rpx", "height": "42rpx" }
            })
          ])
        ]),
        vue.createElementVNode("view", {
          class: "tool-grid",
          style: { "display": "flex", "flex-wrap": "wrap", "justify-content": "space-between" }
        }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.primaryTools, (tool) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                key: tool.title,
                class: "tool-card",
                style: { "width": "48%", "height": "202rpx", "margin-bottom": "18rpx", "padding": "20rpx", "box-sizing": "border-box", "border-radius": "16rpx", "background": "#ffffff", "border": "1rpx solid #d7dee8", "display": "flex", "flex-direction": "column", "align-items": "center", "justify-content": "center" },
                onClick: ($event) => $options.handleTool(tool)
              }, [
                vue.createElementVNode("view", {
                  class: "tool-icon-shell",
                  style: { "width": "88rpx", "height": "88rpx", "display": "flex", "align-items": "center", "justify-content": "center", "border-radius": "24rpx", "background": "#ecfdf5" }
                }, [
                  vue.createElementVNode("image", {
                    class: "tool-image",
                    src: tool.icon,
                    mode: "aspectFit",
                    style: { "width": "68rpx", "height": "68rpx" }
                  }, null, 8, ["src"])
                ]),
                vue.createElementVNode(
                  "text",
                  {
                    class: "tool-title",
                    style: { "display": "block", "margin-top": "14rpx", "font-size": "28rpx", "font-weight": "500", "line-height": "1.35", "color": "#111827", "text-align": "center" }
                  },
                  vue.toDisplayString(tool.title),
                  1
                  /* TEXT */
                )
              ], 8, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          )),
          vue.createElementVNode("view", {
            class: "records-entry",
            style: { "width": "100%", "height": "112rpx", "padding": "20rpx", "box-sizing": "border-box", "border-radius": "16rpx", "background": "#ffffff", "border": "1rpx solid #d7dee8", "display": "flex", "align-items": "center", "justify-content": "center" },
            onClick: _cache[1] || (_cache[1] = ($event) => $options.goTab("/pages/records/records"))
          }, [
            vue.createElementVNode("view", {
              class: "history-icon-shell",
              style: { "width": "76rpx", "height": "76rpx", "display": "flex", "align-items": "center", "justify-content": "center", "border-radius": "22rpx", "background": "#ecfdf5" }
            }, [
              vue.createElementVNode("image", {
                class: "history-image",
                src: _imports_2$1,
                mode: "aspectFit",
                style: { "width": "58rpx", "height": "58rpx" }
              })
            ]),
            vue.createElementVNode("text", {
              class: "tool-title",
              style: { "display": "block", "margin-left": "18rpx", "font-size": "28rpx", "font-weight": "500", "color": "#111827" }
            }, "扫码记录")
          ])
        ]),
        vue.createElementVNode("view", {
          class: "records-section",
          style: { "display": "flex", "flex-direction": "column" }
        }, [
          vue.createElementVNode("view", {
            class: "section-head",
            style: { "display": "flex", "align-items": "center", "justify-content": "space-between" }
          }, [
            vue.createElementVNode("text", {
              class: "section-title",
              style: { "font-size": "30rpx", "font-weight": "600", "color": "#111827" }
            }, "最近记录"),
            vue.createElementVNode("text", {
              class: "section-more",
              style: { "font-size": "24rpx", "color": "#0f766e" },
              onClick: _cache[2] || (_cache[2] = ($event) => $options.goTab("/pages/records/records"))
            }, "查看更多 ›")
          ]),
          vue.createElementVNode("view", {
            class: "record-list",
            style: { "margin-top": "16rpx", "border-radius": "16rpx", "background": "#ffffff", "border": "1rpx solid #d7dee8", "overflow": "hidden" }
          }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($data.records, (record) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  key: record.title,
                  class: "record-item",
                  style: { "min-height": "104rpx", "padding": "18rpx 20rpx", "border-top": "1rpx solid #d7dee8", "display": "flex", "align-items": "center", "box-sizing": "border-box" },
                  onClick: _cache[3] || (_cache[3] = ($event) => $options.goTab("/pages/records/records"))
                }, [
                  vue.createElementVNode("image", {
                    class: "record-icon",
                    src: record.icon,
                    mode: "aspectFit",
                    style: { "width": "76rpx", "height": "76rpx", "border-radius": "38rpx", "flex-shrink": "0" }
                  }, null, 8, ["src"]),
                  vue.createElementVNode("view", {
                    class: "record-content",
                    style: { "flex": "1", "min-width": "0", "margin-left": "18rpx", "display": "flex", "flex-direction": "column" }
                  }, [
                    vue.createElementVNode(
                      "text",
                      {
                        class: "record-title",
                        style: { "font-size": "28rpx", "font-weight": "600", "line-height": "1.35", "color": "#111827" }
                      },
                      vue.toDisplayString(record.title),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      {
                        class: "record-type-text",
                        style: { "margin-top": "4rpx", "font-size": "22rpx", "line-height": "1.25", "color": "#0f766e" }
                      },
                      vue.toDisplayString(record.type),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      {
                        class: "record-desc",
                        style: { "margin-top": "4rpx", "font-size": "22rpx", "line-height": "1.35", "color": "#667085", "overflow": "hidden", "text-overflow": "ellipsis", "white-space": "nowrap" }
                      },
                      vue.toDisplayString(record.desc),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode("image", {
                    class: "record-star",
                    src: _imports_3,
                    mode: "aspectFit",
                    style: { "width": "36rpx", "height": "36rpx", "margin-left": "14rpx", "opacity": "0.42", "flex-shrink": "0" }
                  })
                ]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ]),
        vue.createElementVNode("view", {
          class: "bottom-nav",
          style: { "position": "fixed", "left": "0", "right": "0", "bottom": "0", "height": "112rpx", "padding-bottom": "env(safe-area-inset-bottom)", "background": "#ffffff", "border-top": "1rpx solid #d7dee8", "display": "flex", "align-items": "center", "justify-content": "space-around", "z-index": "20" }
        }, [
          vue.createElementVNode("view", {
            class: "nav-item active",
            style: { "width": "140rpx", "display": "flex", "flex-direction": "column", "align-items": "center", "justify-content": "center" },
            onClick: _cache[4] || (_cache[4] = ($event) => $options.goTab("/pages/index/index"))
          }, [
            vue.createElementVNode("image", {
              class: "nav-icon",
              src: _imports_0$1,
              mode: "aspectFit",
              style: { "width": "42rpx", "height": "42rpx" }
            }),
            vue.createElementVNode("text", {
              class: "nav-text",
              style: { "margin-top": "4rpx", "font-size": "22rpx", "line-height": "1.2", "color": "#064e4a" }
            }, "首页")
          ]),
          vue.createElementVNode("view", {
            class: "nav-item",
            style: { "width": "140rpx", "display": "flex", "flex-direction": "column", "align-items": "center", "justify-content": "center" },
            onClick: _cache[5] || (_cache[5] = ($event) => $options.goTab("/pages/generate/generate"))
          }, [
            vue.createElementVNode("image", {
              class: "nav-icon",
              src: _imports_1$1,
              mode: "aspectFit",
              style: { "width": "42rpx", "height": "42rpx", "opacity": "0.58" }
            }),
            vue.createElementVNode("text", {
              class: "nav-text",
              style: { "margin-top": "4rpx", "font-size": "22rpx", "line-height": "1.2", "color": "#667085" }
            }, "生成")
          ]),
          vue.createElementVNode("view", {
            class: "nav-item",
            style: { "width": "140rpx", "display": "flex", "flex-direction": "column", "align-items": "center", "justify-content": "center" },
            onClick: _cache[6] || (_cache[6] = ($event) => $options.goTab("/pages/records/records"))
          }, [
            vue.createElementVNode("image", {
              class: "nav-icon",
              src: _imports_2,
              mode: "aspectFit",
              style: { "width": "42rpx", "height": "42rpx", "opacity": "0.58" }
            }),
            vue.createElementVNode("text", {
              class: "nav-text",
              style: { "margin-top": "4rpx", "font-size": "22rpx", "line-height": "1.2", "color": "#667085" }
            }, "记录")
          ])
        ])
      ],
      4
      /* STYLE */
    );
  }
  const PagesIndexIndex = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["render", _sfc_render$5], ["__file", "C:/Users/Yt/Desktop/Github_code/OmniQR/OmniQR-Uniapp/pages/index/index.vue"]]);
  const _sfc_main$5 = {
    props: {
      active: {
        type: String,
        default: "home"
      }
    },
    methods: {
      go(url) {
        uni.reLaunch({ url });
      },
      iconStyle(key) {
        return {
          width: "42rpx",
          height: "42rpx",
          opacity: this.active === key ? 1 : 0.58
        };
      },
      textStyle(key) {
        return {
          marginTop: "4rpx",
          fontSize: "22rpx",
          lineHeight: 1.2,
          color: this.active === key ? "#064e4a" : "#667085"
        };
      }
    }
  };
  function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", {
      class: "bottom-nav",
      style: { "position": "fixed", "left": "0", "right": "0", "bottom": "0", "height": "112rpx", "padding-bottom": "env(safe-area-inset-bottom)", "background": "#ffffff", "border-top": "1rpx solid #e5e7eb", "display": "flex", "align-items": "center", "justify-content": "space-around", "z-index": "20" }
    }, [
      vue.createElementVNode(
        "view",
        {
          class: vue.normalizeClass(["nav-item", { active: $props.active === "home" }]),
          style: { "width": "140rpx", "display": "flex", "flex-direction": "column", "align-items": "center", "justify-content": "center" },
          onClick: _cache[0] || (_cache[0] = ($event) => $options.go("/pages/index/index"))
        },
        [
          vue.createElementVNode(
            "image",
            {
              class: "nav-icon",
              src: _imports_0$1,
              mode: "aspectFit",
              style: vue.normalizeStyle($options.iconStyle("home"))
            },
            null,
            4
            /* STYLE */
          ),
          vue.createElementVNode(
            "text",
            {
              class: "nav-text",
              style: vue.normalizeStyle($options.textStyle("home"))
            },
            "首页",
            4
            /* STYLE */
          )
        ],
        2
        /* CLASS */
      ),
      vue.createElementVNode(
        "view",
        {
          class: vue.normalizeClass(["nav-item", { active: $props.active === "generate" }]),
          style: { "width": "140rpx", "display": "flex", "flex-direction": "column", "align-items": "center", "justify-content": "center" },
          onClick: _cache[1] || (_cache[1] = ($event) => $options.go("/pages/generate/generate"))
        },
        [
          vue.createElementVNode(
            "image",
            {
              class: "nav-icon",
              src: _imports_1$1,
              mode: "aspectFit",
              style: vue.normalizeStyle($options.iconStyle("generate"))
            },
            null,
            4
            /* STYLE */
          ),
          vue.createElementVNode(
            "text",
            {
              class: "nav-text",
              style: vue.normalizeStyle($options.textStyle("generate"))
            },
            "生成",
            4
            /* STYLE */
          )
        ],
        2
        /* CLASS */
      ),
      vue.createElementVNode(
        "view",
        {
          class: vue.normalizeClass(["nav-item", { active: $props.active === "records" }]),
          style: { "width": "140rpx", "display": "flex", "flex-direction": "column", "align-items": "center", "justify-content": "center" },
          onClick: _cache[2] || (_cache[2] = ($event) => $options.go("/pages/records/records"))
        },
        [
          vue.createElementVNode(
            "image",
            {
              class: "nav-icon",
              src: _imports_2,
              mode: "aspectFit",
              style: vue.normalizeStyle($options.iconStyle("records"))
            },
            null,
            4
            /* STYLE */
          ),
          vue.createElementVNode(
            "text",
            {
              class: "nav-text",
              style: vue.normalizeStyle($options.textStyle("records"))
            },
            "记录",
            4
            /* STYLE */
          )
        ],
        2
        /* CLASS */
      )
    ]);
  }
  const AppTabBar = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$4], ["__file", "C:/Users/Yt/Desktop/Github_code/OmniQR/OmniQR-Uniapp/components/AppTabBar.vue"]]);
  const _sfc_main$4 = {
    components: {
      AppTabBar
    },
    data() {
      return {
        safeTop: 48,
        types: ["链接", "文本", "自定义内容"],
        typeIndex: 0,
        content: "",
        title: ""
      };
    },
    onLoad(query) {
      this.safeTop = this.getSafeTop();
      if (query && query.content) {
        this.content = decodeURIComponent(query.content);
      }
      if (query && query.source === "scan") {
        this.title = "扫码结果";
      }
    },
    onShow() {
      const pendingContent = uni.getStorageSync("omniqr_pending_generate_content");
      const pendingSource = uni.getStorageSync("omniqr_pending_generate_source");
      if (pendingContent) {
        this.content = pendingContent;
        this.title = pendingSource === "scan" ? "扫码结果" : this.title;
        uni.removeStorageSync("omniqr_pending_generate_content");
        uni.removeStorageSync("omniqr_pending_generate_source");
      }
    },
    methods: {
      getSafeTop() {
        const info = uni.getSystemInfoSync();
        return (info.statusBarHeight || 24) + 12;
      },
      goTab(url) {
        uni.reLaunch({
          url
        });
      },
      onTypeChange(event) {
        this.typeIndex = Number(event.detail.value);
      },
      getSegmentStyle(index) {
        const active = this.typeIndex === index;
        return {
          flex: 1,
          height: "64rpx",
          borderRadius: "14rpx",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: active ? "#0f766e" : "transparent"
        };
      },
      handleGenerate() {
        if (!this.content.trim()) {
          uni.showToast({
            title: "请输入二维码内容",
            icon: "none"
          });
          return;
        }
        uni.showToast({
          title: "二维码内容已生成",
          icon: "none"
        });
      },
      copyContent() {
        if (!this.content.trim()) {
          uni.showToast({
            title: "暂无可复制内容",
            icon: "none"
          });
          return;
        }
        uni.setClipboardData({
          data: this.content
        });
      },
      saveRecord() {
        if (!this.content.trim()) {
          uni.showToast({
            title: "请输入二维码内容",
            icon: "none"
          });
          return;
        }
        const type = this.types[this.typeIndex] === "链接" ? "链接" : "文本";
        addRecord({
          title: this.title.trim() || this.content.slice(0, 16) || "未命名二维码",
          type,
          content: this.content,
          desc: this.content.length > 32 ? `${this.content.slice(0, 32)}...` : this.content
        });
        uni.showToast({
          title: "已保存到记录",
          icon: "success"
        });
      },
      showTodo(name) {
        uni.showToast({
          title: `${name}待接入`,
          icon: "none"
        });
      }
    }
  };
  const _imports_0 = "/static/icons/back.webp";
  const _imports_1 = "/static/icons/generate.webp";
  function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_AppTabBar = vue.resolveComponent("AppTabBar");
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: "page generate-page",
        style: vue.normalizeStyle({ paddingTop: $data.safeTop + "px" })
      },
      [
        vue.createElementVNode("view", {
          class: "topbar",
          style: { "height": "72rpx", "display": "flex", "align-items": "center", "justify-content": "space-between" }
        }, [
          vue.createElementVNode("image", {
            class: "back-icon",
            src: _imports_0,
            mode: "aspectFit",
            style: { "width": "64rpx", "height": "64rpx", "flex-shrink": "0" },
            onClick: _cache[0] || (_cache[0] = ($event) => $options.goTab("/pages/index/index"))
          }),
          vue.createElementVNode("text", {
            class: "topbar-title",
            style: { "font-size": "36rpx", "font-weight": "700", "line-height": "1.2", "color": "#111827" }
          }, "生成二维码"),
          vue.createElementVNode("view", {
            class: "topbar-spacer",
            style: { "width": "64rpx", "height": "64rpx" }
          })
        ]),
        vue.createElementVNode("view", {
          class: "form-card compact-card",
          style: { "margin-top": "18rpx", "padding": "24rpx", "border-radius": "20rpx", "background": "#ffffff", "border": "1rpx solid #d7dee8" }
        }, [
          vue.createElementVNode("view", {
            class: "segmented",
            style: { "display": "flex", "padding": "6rpx", "border-radius": "18rpx", "background": "#f1f5f9" }
          }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($data.types, (type, index) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  key: type,
                  class: vue.normalizeClass(["segment-item", { active: $data.typeIndex === index }]),
                  style: vue.normalizeStyle($options.getSegmentStyle(index)),
                  onClick: ($event) => $data.typeIndex = index
                }, [
                  vue.createElementVNode(
                    "text",
                    {
                      class: "segment-text",
                      style: vue.normalizeStyle({ color: $data.typeIndex === index ? "#ffffff" : "#475467" })
                    },
                    vue.toDisplayString(type),
                    5
                    /* TEXT, STYLE */
                  )
                ], 14, ["onClick"]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ]),
          vue.createElementVNode("view", {
            class: "field",
            style: { "margin-top": "24rpx", "display": "flex", "flex-direction": "column" }
          }, [
            vue.createElementVNode("view", {
              class: "field-head",
              style: { "display": "flex", "align-items": "center", "justify-content": "space-between" }
            }, [
              vue.createElementVNode("text", {
                class: "label",
                style: { "font-size": "28rpx", "font-weight": "650", "color": "#18202c" }
              }, "二维码内容"),
              vue.createElementVNode(
                "text",
                {
                  class: "field-count",
                  style: { "font-size": "22rpx", "color": "#98a2b3" }
                },
                vue.toDisplayString($data.content.length) + "/1000",
                1
                /* TEXT */
              )
            ]),
            vue.withDirectives(vue.createElementVNode(
              "textarea",
              {
                class: "textarea content-textarea",
                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $data.content = $event),
                maxlength: "1000",
                placeholder: "输入文本、链接或自定义内容",
                style: { "width": "100%", "height": "204rpx", "margin-top": "12rpx", "padding": "22rpx", "border-radius": "16rpx", "border": "1rpx solid #b8c4d0", "background": "#ffffff", "font-size": "28rpx", "line-height": "1.45", "box-sizing": "border-box" }
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $data.content]
            ])
          ]),
          vue.createElementVNode("view", {
            class: "field",
            style: { "margin-top": "20rpx", "display": "flex", "flex-direction": "column" }
          }, [
            vue.createElementVNode("text", {
              class: "label",
              style: { "font-size": "28rpx", "font-weight": "650", "color": "#18202c" }
            }, "备注名称"),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "input",
                "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $data.title = $event),
                placeholder: "例如：项目链接",
                style: { "height": "78rpx", "margin-top": "12rpx", "padding": "0 22rpx", "border-radius": "16rpx", "border": "1rpx solid #b8c4d0", "background": "#ffffff", "font-size": "28rpx", "line-height": "78rpx", "box-sizing": "border-box" }
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $data.title]
            ])
          ])
        ]),
        vue.createElementVNode("view", {
          class: "preview-card compact-card",
          style: { "margin-top": "18rpx", "padding": "24rpx", "border-radius": "20rpx", "background": "#ffffff", "border": "1rpx solid #d7dee8" }
        }, [
          vue.createElementVNode("view", {
            class: "preview-head",
            style: { "display": "flex", "align-items": "center", "justify-content": "space-between" }
          }, [
            vue.createElementVNode("text", {
              class: "section-title",
              style: { "font-size": "30rpx", "font-weight": "700", "color": "#111827" }
            }, "二维码预览"),
            vue.createElementVNode(
              "text",
              {
                class: "preview-status",
                style: { "font-size": "22rpx", "color": "#0f766e" }
              },
              vue.toDisplayString($data.content.trim() ? "可生成" : "等待输入"),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", {
            class: "qr-stage",
            style: { "margin-top": "18rpx", "display": "flex", "align-items": "center", "justify-content": "center" }
          }, [
            vue.createElementVNode("view", {
              class: "qr-placeholder",
              style: { "width": "300rpx", "height": "300rpx", "border-radius": "22rpx", "background": "#f8fafc", "border": "1rpx dashed #b8c4d0", "display": "flex", "flex-direction": "column", "align-items": "center", "justify-content": "center" }
            }, [
              vue.createElementVNode("image", {
                class: "preview-icon",
                src: _imports_1,
                mode: "aspectFit",
                style: { "width": "92rpx", "height": "92rpx" }
              }),
              vue.createElementVNode("text", {
                class: "qr-desc",
                style: { "margin-top": "12rpx", "font-size": "24rpx", "color": "#667085" }
              }, "待接入生成组件")
            ])
          ]),
          vue.createElementVNode("button", {
            class: "primary-button",
            style: { "width": "100%", "height": "86rpx", "margin": "22rpx 0 0", "padding": "0", "border": "0", "border-radius": "16rpx", "background": "#0f766e", "color": "#ffffff", "font-size": "30rpx", "font-weight": "650", "line-height": "86rpx", "box-sizing": "border-box", "overflow": "hidden" },
            onClick: _cache[3] || (_cache[3] = (...args) => $options.handleGenerate && $options.handleGenerate(...args))
          }, "生成"),
          vue.createElementVNode("view", {
            class: "actions",
            style: { "display": "flex", "margin-top": "16rpx" }
          }, [
            vue.createElementVNode("button", {
              class: "ghost-button",
              style: { "flex": "1", "height": "78rpx", "margin": "0 12rpx 0 0", "padding": "0", "border-radius": "16rpx", "background": "#ffffff", "color": "#0f766e", "border": "2rpx solid #0f766e", "font-size": "28rpx", "line-height": "78rpx", "box-sizing": "border-box", "overflow": "hidden" },
              onClick: _cache[4] || (_cache[4] = (...args) => $options.saveRecord && $options.saveRecord(...args))
            }, "保存记录"),
            vue.createElementVNode("button", {
              class: "ghost-button",
              style: { "flex": "1", "height": "78rpx", "margin": "0 0 0 12rpx", "padding": "0", "border-radius": "16rpx", "background": "#ffffff", "color": "#0f766e", "border": "2rpx solid #0f766e", "font-size": "28rpx", "line-height": "78rpx", "box-sizing": "border-box", "overflow": "hidden" },
              onClick: _cache[5] || (_cache[5] = (...args) => $options.copyContent && $options.copyContent(...args))
            }, "复制内容")
          ])
        ]),
        vue.createVNode(_component_AppTabBar, { active: "generate" })
      ],
      4
      /* STYLE */
    );
  }
  const PagesGenerateGenerate = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$3], ["__file", "C:/Users/Yt/Desktop/Github_code/OmniQR/OmniQR-Uniapp/pages/generate/generate.vue"]]);
  const _sfc_main$3 = {
    data() {
      return {
        safeTop: 48,
        ssid: "",
        password: "",
        encryptions: ["WPA/WPA2", "WEP", "无密码"],
        encryptionIndex: 0
      };
    },
    onLoad() {
      this.safeTop = this.getSafeTop();
    },
    computed: {
      wifiPayload() {
        const type = this.encryptions[this.encryptionIndex] === "无密码" ? "nopass" : this.encryptions[this.encryptionIndex].replace("/WPA2", "");
        return `WIFI:T:${type};S:${this.ssid || "网络名称"};P:${this.password || "网络密码"};H:false;;`;
      }
    },
    methods: {
      getSafeTop() {
        const info = uni.getSystemInfoSync();
        return (info.statusBarHeight || 24) + 12;
      },
      goBack() {
        uni.navigateBack({
          fail: () => {
            uni.reLaunch({
              url: "/pages/index/index"
            });
          }
        });
      },
      onEncryptionChange(event) {
        this.encryptionIndex = Number(event.detail.value);
      },
      submit() {
        if (!this.ssid.trim()) {
          uni.showToast({
            title: "请输入WiFi名称",
            icon: "none"
          });
          return;
        }
        uni.showToast({
          title: "二维码生成待接入",
          icon: "none"
        });
      }
    }
  };
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: "page",
        style: vue.normalizeStyle({ paddingTop: $data.safeTop + "px" })
      },
      [
        vue.createElementVNode("view", { class: "topbar" }, [
          vue.createElementVNode("image", {
            class: "back-icon",
            src: _imports_0,
            mode: "aspectFit",
            style: { "width": "64rpx", "height": "64rpx", "flex-shrink": "0" },
            onClick: _cache[0] || (_cache[0] = (...args) => $options.goBack && $options.goBack(...args))
          }),
          vue.createElementVNode("text", { class: "topbar-title" }, "WiFi二维码"),
          vue.createElementVNode("view", { class: "topbar-spacer" })
        ]),
        vue.createElementVNode("view", { class: "card" }, [
          vue.createElementVNode("text", { class: "page-desc" }, "录入网络信息后生成可扫码连接的 WiFi 二维码。"),
          vue.createElementVNode("view", { class: "field" }, [
            vue.createElementVNode("text", { class: "label" }, "WiFi名称 SSID"),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "input",
                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $data.ssid = $event),
                placeholder: "例如：OmniQR-Guest"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $data.ssid]
            ])
          ]),
          vue.createElementVNode("view", { class: "field" }, [
            vue.createElementVNode("text", { class: "label" }, "WiFi密码"),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "input",
                "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $data.password = $event),
                password: "",
                placeholder: "输入无线网络密码"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $data.password]
            ])
          ]),
          vue.createElementVNode("view", { class: "field" }, [
            vue.createElementVNode("text", { class: "label" }, "加密方式"),
            vue.createElementVNode("picker", {
              range: $data.encryptions,
              value: $data.encryptionIndex,
              onChange: _cache[3] || (_cache[3] = (...args) => $options.onEncryptionChange && $options.onEncryptionChange(...args))
            }, [
              vue.createElementVNode(
                "view",
                { class: "picker" },
                vue.toDisplayString($data.encryptions[$data.encryptionIndex]),
                1
                /* TEXT */
              )
            ], 40, ["range", "value"])
          ]),
          vue.createElementVNode("view", { class: "preview" }, [
            vue.createElementVNode("text", { class: "preview-title" }, "内容预览"),
            vue.createElementVNode(
              "text",
              { class: "preview-text" },
              vue.toDisplayString($options.wifiPayload),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("button", {
            class: "primary-button",
            onClick: _cache[4] || (_cache[4] = (...args) => $options.submit && $options.submit(...args))
          }, "生成WiFi二维码")
        ])
      ],
      4
      /* STYLE */
    );
  }
  const PagesWifiWifi = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$2], ["__file", "C:/Users/Yt/Desktop/Github_code/OmniQR/OmniQR-Uniapp/pages/wifi/wifi.vue"]]);
  const _sfc_main$2 = {
    data() {
      return {
        safeTop: 48,
        form: {
          name: "",
          phone: "",
          company: "",
          email: ""
        }
      };
    },
    onLoad() {
      this.safeTop = this.getSafeTop();
    },
    computed: {
      vcard() {
        return [
          "BEGIN:VCARD",
          "VERSION:3.0",
          `FN:${this.form.name || "姓名"}`,
          `ORG:${this.form.company || "公司"}`,
          `TEL:${this.form.phone || "手机号"}`,
          `EMAIL:${this.form.email || "邮箱"}`,
          "END:VCARD"
        ].join("\n");
      }
    },
    methods: {
      getSafeTop() {
        const info = uni.getSystemInfoSync();
        return (info.statusBarHeight || 24) + 12;
      },
      goBack() {
        uni.navigateBack({
          fail: () => {
            uni.reLaunch({
              url: "/pages/index/index"
            });
          }
        });
      },
      submit() {
        if (!this.form.name.trim()) {
          uni.showToast({
            title: "请输入姓名",
            icon: "none"
          });
          return;
        }
        uni.showToast({
          title: "二维码生成待接入",
          icon: "none"
        });
      }
    }
  };
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: "page",
        style: vue.normalizeStyle({ paddingTop: $data.safeTop + "px" })
      },
      [
        vue.createElementVNode("view", { class: "topbar" }, [
          vue.createElementVNode("image", {
            class: "back-icon",
            src: _imports_0,
            mode: "aspectFit",
            style: { "width": "64rpx", "height": "64rpx", "flex-shrink": "0" },
            onClick: _cache[0] || (_cache[0] = (...args) => $options.goBack && $options.goBack(...args))
          }),
          vue.createElementVNode("text", { class: "topbar-title" }, "名片二维码"),
          vue.createElementVNode("view", { class: "topbar-spacer" })
        ]),
        vue.createElementVNode("view", { class: "card" }, [
          vue.createElementVNode("text", { class: "page-desc" }, "生成 vCard 联系人二维码，适合个人名片和客户资料交换。"),
          vue.createElementVNode("view", { class: "field" }, [
            vue.createElementVNode("text", { class: "label" }, "姓名"),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "input",
                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $data.form.name = $event),
                placeholder: "请输入姓名"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $data.form.name]
            ])
          ]),
          vue.createElementVNode("view", { class: "field" }, [
            vue.createElementVNode("text", { class: "label" }, "手机号"),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "input",
                "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $data.form.phone = $event),
                placeholder: "请输入手机号"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $data.form.phone]
            ])
          ]),
          vue.createElementVNode("view", { class: "field" }, [
            vue.createElementVNode("text", { class: "label" }, "公司"),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "input",
                "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $data.form.company = $event),
                placeholder: "请输入公司名称"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $data.form.company]
            ])
          ]),
          vue.createElementVNode("view", { class: "field" }, [
            vue.createElementVNode("text", { class: "label" }, "邮箱"),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "input",
                "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => $data.form.email = $event),
                placeholder: "请输入邮箱"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $data.form.email]
            ])
          ]),
          vue.createElementVNode("view", { class: "preview" }, [
            vue.createElementVNode("text", { class: "preview-title" }, "vCard预览"),
            vue.createElementVNode(
              "text",
              { class: "preview-text" },
              vue.toDisplayString($options.vcard),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("button", {
            class: "primary-button",
            onClick: _cache[5] || (_cache[5] = (...args) => $options.submit && $options.submit(...args))
          }, "生成名片二维码")
        ])
      ],
      4
      /* STYLE */
    );
  }
  const PagesContactContact = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$1], ["__file", "C:/Users/Yt/Desktop/Github_code/OmniQR/OmniQR-Uniapp/pages/contact/contact.vue"]]);
  const _sfc_main$1 = {
    data() {
      return {
        safeTop: 48,
        keyword: "",
        favoriteTapped: false,
        activeTab: "全部",
        tabs: ["全部", "收藏", "WiFi", "名片", "链接"],
        records: []
      };
    },
    onLoad() {
      this.safeTop = this.getSafeTop();
    },
    onShow() {
      this.records = listRecords().map((record) => ({
        ...record,
        time: this.formatTime(record.createdAt)
      }));
    },
    computed: {
      filteredRecords() {
        return this.records.filter((record) => {
          const matchTab = this.activeTab === "全部" || (this.activeTab === "收藏" ? record.favorite : record.type === this.activeTab);
          const text = `${record.title} ${record.desc} ${record.type}`;
          const matchKeyword = !this.keyword || text.toLowerCase().includes(this.keyword.toLowerCase());
          return matchTab && matchKeyword;
        });
      }
    },
    methods: {
      getSafeTop() {
        const info = uni.getSystemInfoSync();
        return (info.statusBarHeight || 24) + 12;
      },
      goTab(url) {
        uni.reLaunch({
          url
        });
      },
      getRecordIcon(record) {
        const map = {
          WiFi: "/static/icons/wifi.webp",
          名片: "/static/icons/contact.webp",
          链接: "/static/icons/generate.webp",
          文本: "/static/icons/generate.webp",
          扫码: "/static/icons/scan.webp"
        };
        return map[record.type] || "/static/icons/records.webp";
      },
      openRecord(record) {
        if (this.favoriteTapped) {
          this.favoriteTapped = false;
          return;
        }
        uni.showToast({
          title: `${record.title}详情待接入`,
          icon: "none"
        });
      },
      toggleRecordFavorite(record) {
        this.favoriteTapped = true;
        this.records = toggleFavorite(record.id).map((item) => ({
          ...item,
          time: this.formatTime(item.createdAt)
        }));
      },
      formatTime(timestamp) {
        if (!timestamp) {
          return "";
        }
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hour = String(date.getHours()).padStart(2, "0");
        const minute = String(date.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day} ${hour}:${minute}`;
      }
    }
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: "page",
        style: vue.normalizeStyle({ paddingTop: $data.safeTop + "px" })
      },
      [
        vue.createElementVNode("view", { class: "topbar" }, [
          vue.createElementVNode("view", { class: "topbar-spacer" }),
          vue.createElementVNode("text", { class: "topbar-title" }, "扫码记录"),
          vue.createElementVNode("view", { class: "topbar-spacer" })
        ]),
        vue.createElementVNode("view", { class: "search-box" }, [
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              class: "search-input",
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.keyword = $event),
              placeholder: "搜索记录"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $data.keyword]
          ])
        ]),
        vue.createElementVNode("view", { class: "tabs" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.tabs, (tab) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                key: tab,
                class: vue.normalizeClass(["tab", { active: $data.activeTab === tab }]),
                onClick: ($event) => $data.activeTab = tab
              }, vue.toDisplayString(tab), 11, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ]),
        vue.createElementVNode("view", { class: "record-list" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($options.filteredRecords, (record) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                key: record.title,
                class: "record-card",
                onClick: ($event) => $options.openRecord(record)
              }, [
                vue.createElementVNode("image", {
                  class: "record-icon",
                  src: $options.getRecordIcon(record),
                  mode: "aspectFit",
                  style: { "width": "76rpx", "height": "76rpx", "border-radius": "38rpx", "flex-shrink": "0" }
                }, null, 8, ["src"]),
                vue.createElementVNode("view", { class: "record-main" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "record-title" },
                    vue.toDisplayString(record.title),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "record-meta" },
                    vue.toDisplayString(record.type) + " · " + vue.toDisplayString(record.time),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "record-desc" },
                    vue.toDisplayString(record.desc),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("image", {
                  class: "star",
                  src: record.favorite ? "/static/icons/star-filled.webp" : "/static/icons/star-outline.webp",
                  mode: "aspectFit",
                  style: { "width": "42rpx", "height": "42rpx", "flex-shrink": "0" },
                  onClick: ($event) => $options.toggleRecordFavorite(record)
                }, null, 8, ["src", "onClick"])
              ], 8, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ]),
        vue.createElementVNode("view", { class: "bottom-nav" }, [
          vue.createElementVNode("view", {
            class: "nav-item",
            onClick: _cache[1] || (_cache[1] = ($event) => $options.goTab("/pages/index/index"))
          }, [
            vue.createElementVNode("image", {
              class: "nav-icon",
              src: _imports_0$1,
              mode: "aspectFit",
              style: { "width": "42rpx", "height": "42rpx", "opacity": "0.58" }
            }),
            vue.createElementVNode("text", { class: "nav-text" }, "首页")
          ]),
          vue.createElementVNode("view", {
            class: "nav-item",
            onClick: _cache[2] || (_cache[2] = ($event) => $options.goTab("/pages/generate/generate"))
          }, [
            vue.createElementVNode("image", {
              class: "nav-icon",
              src: _imports_1$1,
              mode: "aspectFit",
              style: { "width": "42rpx", "height": "42rpx", "opacity": "0.58" }
            }),
            vue.createElementVNode("text", { class: "nav-text" }, "生成")
          ]),
          vue.createElementVNode("view", {
            class: "nav-item active",
            onClick: _cache[3] || (_cache[3] = ($event) => $options.goTab("/pages/records/records"))
          }, [
            vue.createElementVNode("image", {
              class: "nav-icon",
              src: _imports_2,
              mode: "aspectFit",
              style: { "width": "42rpx", "height": "42rpx" }
            }),
            vue.createElementVNode("text", { class: "nav-text" }, "记录")
          ])
        ])
      ],
      4
      /* STYLE */
    );
  }
  const PagesRecordsRecords = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__file", "C:/Users/Yt/Desktop/Github_code/OmniQR/OmniQR-Uniapp/pages/records/records.vue"]]);
  __definePage("pages/index/index", PagesIndexIndex);
  __definePage("pages/generate/generate", PagesGenerateGenerate);
  __definePage("pages/wifi/wifi", PagesWifiWifi);
  __definePage("pages/contact/contact", PagesContactContact);
  __definePage("pages/records/records", PagesRecordsRecords);
  const _sfc_main = {
    onLaunch() {
    },
    onShow() {
    },
    onHide() {
    }
  };
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "C:/Users/Yt/Desktop/Github_code/OmniQR/OmniQR-Uniapp/App.vue"]]);
  function createApp() {
    const app = vue.createVueApp(App);
    return {
      app
    };
  }
  const { app: __app__, Vuex: __Vuex__, Pinia: __Pinia__ } = createApp();
  uni.Vuex = __Vuex__;
  uni.Pinia = __Pinia__;
  __app__.provide("__globalStyles", __uniConfig.styles);
  __app__._component.mpType = "app";
  __app__._component.render = () => {
  };
  __app__.mount("#app");
})(Vue);
