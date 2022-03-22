// ==UserScript==
// @name         MC方便B端系统发版的快捷小工具
// @namespace    http://tampermonkey.net/
// @version      0.2.6
// @description  支持批量打开uwp和suwp子系统的jenkins与gitlab, 也支持空格批量打开多个单系统dap scm...的jenkins/gitlab
// @author       mrzou
// @match        https://bl-sc-pms-t-1.digi800.com/#/index
// @icon         https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif?imageView2/1/w/80/h/80
// @include      *://bl-**.digi800.com/*
// @include      **.digi800.com/*
// @include      http://localhost**
// @include      http://**.**.**.**:**/**
// @require      https://cdn.bootcdn.net/ajax/libs/jquery/3.6.0/jquery.min.js
// @license MIT
// @grant        none
// @updateURL   https://git.opsfun.com/qingyun/project-publish-tool/src/branch/main/index.js
// ==/UserScript==

;(function () {
  "use strict"
  setTimeout(function () {
    $(function () {
      function getHtml() {
        var isHide = localStorage.getItem("monkey-plugin-hide")
        var style = `
              <style>
                  .monkey-plugin-warp{
                    width: 240px;height: auto;background: rgba(0,0,0,0.3);
                    font-size: 12px;color: #333;text-align: center;position: fixed;z-index: 9999999999;
                    top: 10%;right: 10%;marin: 0;padding: 0;user-select: none;transition: all 0.3s;
                  }
                  .monkey-plugin-tips{
                    color: green;text-align:left;display:block;
                  }
                  .monkey-plugin-warp.close{
                    top: 0;right: 0;width: 0;height: 0;
                  }
                  .monkey-plugin-warp ul {
                    list-style: none;text-align: left;margin: 0;padding: 0 0 5px 0;
                    display: flex;flex-wrap: wrap;align-items: center;
                  }
                  .monkey-plugin-warp ul button {
                    padding: 2px;margin: 5px 5px 0;cursor: pointer;background: #fff;
                    border: 1px solid #333;border-radius: 3px;
                  }
                  .monkey-plugin-warp input{
                    marin: 0;padding: 0;width: 100%;border: 1px solid #333;
                    box-sizing:  border-box;outline: none;text-indent: 12px;
                  }
                  .monkey-plugin-close, .monkey-plugin-entry{
                    position: absolute;top: -5px;right: -5px;width: 16px;height: 16px;
                    text-align: center;line-height: 16px;background: yellow;border-radius: 16px;
                    border: 1px solid red;color: red;cursor: pointer;
                  }
                  .monkey-plugin-entry{
                    top: 0;right: 0;width: 45px;line-height: 16px;height: 16px;
                  }
              </style>
              `
        return (
          style +
          `<div class="monkey-plugin-warp ${isHide ? "close" : ""}">
          <span class="monkey-plugin-close ${
            isHide ? "monkey-plugin-entry" : ""
          }">
          ${isHide ? "open" : "X"}  
          </span>
          <i class="monkey-plugin-tips">
            suwp-a/uwp-a为子系统批量操作<br/>支持空格批量<br/>dap scm riven-pc riven-m...
            <i 
              style="font-size: 20px;font-weight: bold;color:red;"
              title="riven-pc riven-m suwp-a uwp-a uwp suwp scm dap plm dms pms dms qms mms splm mps smms"
            >?</i>
          </i>
          <input class="monkey-plugin-input" placeholder="suwp-a/uwp-a(默认)/单(多)个系统名" />
          <ul>
            <button val="test">测试jenkins</button>
            <button val="prod">正式jenkins</button>
            <button val="gitlab">gitlab发master</button>
          </ul>
        </div>
      </div>`
        )
      }

      function handler(type, target) {
        var uwpSystems = [
          "bl-pms-front-end",
          "bl-dap-front-end",
          "bl-plm-front-end",
          "bl-dms-front-end",
          "bl-qms-front-end",
          "bl-mms-front-end",
          "bl-uwp-front-end",
        ]
        var suwpSystems = [
          "bl-suwp-front-end",
          "bl-mps-front-end",
          "bl-splm-front-end",
          "bl-smms-front-end",
        ]

        var JenkinsBase = "https://jenkins.opsfun.com/job/"
        var gitlabBlBase = "https://git.opsfun.com/bl_supply_chain/"

        function searchSystem(systems, type) {
          var system = systems.filter((item) => item.includes(`-${type}-`))
          if (!system.length) {
            console.log(`%c油猴插件提示：没有此系统${type}`, "color:#fd6327")
          }
          return system || []
        }
        function jenkins(systems, systemType) {
          var prod = $(target).attr("val").includes("prod")
          systems = systemType ? searchSystem(systems, systemType) : systems
          systems
            .map((item) => {
              return (
                JenkinsBase +
                item +
                (prod ? "-prod" : "-test") +
                "/build?delay=0sec"
              )
            })
            .forEach((u) => window.open(u))
        }
        function gitLab(systems, systemType) {
          //return gitlabBlBase + item + '/compare/master...feature/qingyun/6666_layout'
          systems = systemType ? searchSystem(systems, systemType) : systems
          systems
            .map((item) => gitlabBlBase + item + "/compare/master...master")
            .forEach((u) => window.open(u))
        }
        var isGitlab = $(target).attr("val").includes("gitlab")
        switch (type) {
          case "uwp-a":
            isGitlab ? gitLab(uwpSystems) : jenkins(uwpSystems)
            break
          case "suwp-a":
            isGitlab ? gitLab(suwpSystems) : jenkins(suwpSystems)
            break
          case "scm":
            // scm有差异得专门处理
            const gitlabUrl =
              "https://git.opsfun.com/bl-backend/scm/compare/master...master"
            const prod = $(target).attr("val").includes("prod")
            const jenkinUrl = prod
              ? "https://j.opsfun.com/job/BL-SCM-web-qa-prod.dev/build?delay=0sec"
              : "https://j.opsfun.com/view/BL-SCM/job/BL-SCM-web-new-test.dev/build?delay=0sec"
            window.open(isGitlab ? gitlabUrl : jenkinUrl)
            break
          case "riven-pc":
            // blushmark PC端商城专门处理
            const gitlabUrlPc =
              "https://git.opsfun.com/blushmark-front/riven-blush-mark/compare/develop...develop"
            const prodPc = $(target).attr("val").includes("prod")
            const jenkinUrlPc = prodPc
              ? "https://j.opsfun.com/view/BL-PC/job/BL-PC-Switch-qa-prod.dev/build?delay=0sec"
              : "https://j.opsfun.com/view/BM-FT/job/BL-riven-pc-test.dev/build?delay=0sec"
            window.open(isGitlab ? gitlabUrlPc : jenkinUrlPc)
            break
          case "riven-m":
            // blushmark 手机端商城专门处理
            const gitlabUrlM =
              "https://git.opsfun.com/blushmark-front/riven-blush-mark/compare/develop...develop"
            const prodM = $(target).attr("val").includes("prod")
            const jenkinUrlM = prodM
              ? "https://j.opsfun.com/view/BL-M/job/BL-M-Switch-qa-prod.dev/build?delay=0sec"
              : "https://j.opsfun.com/view/BM-FT/job/BL-riven-m-test.dev/build?delay=0sec"
            window.open(isGitlab ? gitlabUrlM : jenkinUrlM)
            break
          default:
            const Sys = [...uwpSystems, ...suwpSystems]
            isGitlab ? gitLab(Sys, type) : jenkins(Sys, type)
            break
        }
      }
      $("body").append(getHtml())
      $(".monkey-plugin-warp ul button").on("click", function () {
        var inputs = ($(".monkey-plugin-input").val() || "uwp-a")
          .trim()
          .toLocaleLowerCase()
          .split(" ")
          .filter((v) => v)
        inputs.forEach((type) => handler(type, this))
      })
      $(".monkey-plugin-close").on("click", function () {
        var self = $(this)
        if (self.hasClass("monkey-plugin-entry")) {
          $(".monkey-plugin-warp")
            .removeClass("close")
            .on("transitionend", function () {
              localStorage.removeItem("monkey-plugin-hide")
              self.removeClass("monkey-plugin-entry").text("X")
            })
        } else {
          $(".monkey-plugin-warp")
            .addClass("close")
            .on("transitionend", function () {
              localStorage.setItem("monkey-plugin-hide", 1)
              self.addClass("monkey-plugin-entry").text("open")
            })
        }
      })
    })
  }, 1000)
})()
