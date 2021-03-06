/**
 *
 * */

//配置参数,修改该变量修改配置
var conf_densityList = [2, 4, 8, 12, 16, 24];//密度列表
var conf_regionList = [1.05,1.1,1.2, 1.4,1.8];//数据波动列表
var conf_regionListX = [];//随机数的范围最大值,数据波动
var conf_repeat = 2; //block重复次数

//全局变量
var totalTrialCountGlobal = 0;
var totalTrialCountLocal = 0;
var trialCountGlobal = 0;//Global实验的次数
var trialCountLocal = 0;//Local实验的次数
//
var densityOrder = [];//密度列表洗牌后的顺序
var regionOrder = [];//数据波动情况洗牌后的顺序
var regionXOrder = [];//
var mydata1;//记录时间函数
var starttime;//实验开始时间
var endtime;//实验结束时间

/**
 * 初始化实验参数
 */
function initExp1(){
    //JSON.stringify
    for(var i = 0; i < conf_regionList.length; i ++){
        conf_regionListX[i] = 100.0 / conf_regionList[i];
    }
    totalTrialCountGlobal = conf_densityList.length*conf_repeat*conf_regionList.length;
    totalTrialCountLocal = conf_densityList.length*conf_repeat*conf_regionList.length;
    console.log("本次实验需要:"+(totalTrialCountGlobal+totalTrialCountLocal)+"次");
    //显示时间
    mydata1=new Date();
    starttime = mydata1.getTime();
    console.error("实验开始时间为：%d\n",starttime);

    //洗牌
    //https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
    //https://www.zhihu.com/question/32303195
    var tempArray = [];
    for (var i = 0, len = conf_densityList.length; i < len; i++) {
        tempArray[i] = conf_densityList[i];
    }
    for (var i = 0, len = tempArray.length; i < len; i++) {
        var j = Math.floor(Math.random() * tempArray.length);
        densityOrder[i] = tempArray[j];
        tempArray.splice(j, 1);
    }

    var tempArray2 = [];
    for (var i = 0, len = conf_regionList.length; i < len; i++) {
        tempArray[i] = conf_regionList[i];
        tempArray2[i] = conf_regionListX[i];
    }
    for (var i = 0, len = tempArray.length; i < len; i++) {
        var j = Math.floor(Math.random() * tempArray.length);
        regionOrder[i] = tempArray[j];
        regionXOrder[i] = tempArray2[j];
        tempArray.splice(j, 1);
        tempArray2.splice(j,1);
    }

    nextTrial();
}

/**
 * TODO 开始下一个实验
 */
function nextTrial(){
    if(trialCountGlobal ++ < totalTrialCountGlobal){
        //trialCountGlobal ++;
        var densityIndex = parseInt( (trialCountGlobal - 1 ) % (conf_densityList.length * conf_regionList.length) / regionOrder.length );
        var regionIndex =  (trialCountGlobal - 1) % (conf_densityList.length * conf_regionList.length) % regionOrder.length;
        console.log("densityIndexGlobal:regionIndex:"+densityIndex+":"+regionIndex);
        createExpMap(true, densityOrder[densityIndex], regionOrder[regionIndex], regionXOrder[regionIndex]);
    }else if(trialCountLocal ++ < (totalTrialCountLocal - 1)){
        $("#title").text("请找出框出区域的最大值:");
        var densityIndex = parseInt( (trialCountLocal - 1 ) % (conf_densityList.length * conf_regionList.length) / regionOrder.length );
        var regionIndex =  (trialCountLocal - 1) % (conf_densityList.length * conf_regionList.length) % regionOrder.length;
        console.log("densityIndexLocal:regionIndex:"+densityIndex+":"+regionIndex);
        createExpMap(false, densityOrder[densityIndex], regionOrder[regionIndex], regionXOrder[regionIndex]);
    }else{
        //SimpleDateFormat sdf = new SimpleDateFormat("HH;mm;ss;SS");
       // sdf.format(new Date());
        mydata1=new Date();
        endtime= mydata1.getTime();
        var mss=endtime-starttime;
        var minute1 = (mss % (1000 * 60 * 60)) / (1000 * 60);
        var second1 = (mss % (1000 * 60)) / 1000;
        console.error("实验结束时间为：%d\n,总时间为：%d毫秒，约为%f分钟",endtime,mss,minute1);
        console.log("实验结束")
    }
}


/**
 * 创建实验地图
 * isGlobal: 是否全局测试
 *  true:没有边框,全局测试
 *  false:有边框,局部测试
 */
function createExpMap(isGlobal, density, region, regionX) {
    console.log(isGlobal + ":"+density+":"+region+":"+regionX);
    $("#choroplethMap").empty();

    /**
     * y 取1.05,1.1,1.2,1.4,1.8
     * x 1- 95,90,83,71,55
     */
    //var y2 = conf_regionList[region];//
    function x() {
        return Math.random() * regionX;
    }

    var indexOfProv = parseInt(Math.random()*32);//全局最大所在的省份

    var width = 960,
        height = 700;
    var colors = ['#ffffcc','#ffeda0','#fed976','#feb24c','#fd8d3c','#fc4e2a','#e31a1c','#bd0026','#800026'];
    var colorScale = d3.scale.linear()
        .domain([0,12,24,36,48,60,72,84,100]).range(colors);

    var projection = d3.geo.mercator()
        .center([107, 31])
        .scale(600)
        .translate([width / 2, height / 2]);

    var path = d3.geo.path()
        .projection(projection);

    //加载中国地图,china_provinces_remove2删除了香港与澳门
    d3.json("data/china_provinces_remove2.json",
        function (data) {
            var provinces = data.features;
            var sel = d3.select("#choroplethMap").append("svg")
                .attr("width", width)
                .attr("height", height);

            //添加filter
            //https://developer.mozilla.org/en-US/docs/Web/CSS/filter
            sel.append('filter')
                .attr('id', 'desaturate')
                .append('feColorMatrix')
                .attr('type', 'matrix')
                .attr('values', "0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0  0      0      0      1 0");


            /**
             <pattern id="fagl" patternUnits="objectBoundingBox" width="2" height="1" x="-50%">
             <path style="stroke:#FF0; stroke-opacity:1;stroke-width:20;fill-opacity:0;" d="M150 0 L75 200 L225 200 Z">
             </pattern>
             */
            var upd = sel.selectAll('path').data(provinces);
            var pattern = upd.enter()
                .append("pattern")
                .attr("id", function (d) {
                    //console.log(d.id);
                    return "pat" + d.id;
                })
                .attr("patternUnits", "objectBoundingBox")
                .attr("width", "1")
                .attr("height", "1")
                .attr("x", 0)
                .attr("y", 0);
            pattern.append("path")
                .attr("stroke-width", 0.2)//绘制省份的边界
                .attr("fill", "none")
                .attr("stroke", function (d) {
                    return "#000000";
                })
                .attr("d", path)
                .attr("transform", function (d) {
                    var bbox = Snap.path.getBBox(path(d));
                    //需要偏移一段距离
                    //https://jsfiddle.net/sunsnowad/0b1vyk6q/
                    //https://jsfiddle.net/sunsnowad/0b1vyk6q/3/
                    return "translate(" + -bbox.x +
                        "," + -bbox.y + ")";
                });

            /**
             * <clipPath id="clipPath">
             <path id="triangle1" d="M150 0 L75 200 L225 200 Z">
             </clipPath>
             */
            var clippath = upd.enter()
                .append("clipPath")
                .attr("id", function (d) {
                    return "clippath" + d.id;
                })
                .append("path")
                .attr("id", function (d) {
                    return "clippathPath" + d.id;
                })
                .attr("d", path)
                .attr("transform", function (d) {
                    var bbox = Snap.path.getBBox(path(d));
                    //需要偏移一段距离
                    //https://jsfiddle.net/sunsnowad/0b1vyk6q/
                    //https://jsfiddle.net/sunsnowad/0b1vyk6q/3/
                    return "translate(" + -bbox.x +
                        "," + -bbox.y + ")";
                });

            var indexMax = parseInt(Math.random() * density);//最大数值所在的位置[0,density)
            /**
             * <circle cx="145" cy="40" r="20"
             style="fill: #0000ff; clip-path: url(#clipPath); " />
             */
            //绘制矩形框,并填充颜色
            //记录最大的正常值
            var maxNormalValue = 0;
            for (var i = 0; i < provinces.length; i++) {
                var d = provinces[i];

                var bbox = Snap.path.getBBox(path(provinces[i]));
                var tempBarG = sel.append("g")
                    .attr("id", "tempBar" + provinces[i].id)
                    //.attr("x", bbox.x)
                    //.attr("y", bbox.y)
                    .attr("width", bbox.width)
                    .attr("height", bbox.height)
                    .attr("transform", "translate(" + bbox.x + "," + bbox.y + ")");

                for (var j = 0; j < density; j++) {
                    var value = x();
                    if(maxNormalValue < value)
                        maxNormalValue = value;//

                    if(indexOfProv == i && j == indexMax){//最大值绘制
                        //
                    }else{
                        tempBarG.append("rect")
                            .attr("id", "tempbarRectId" + j)
                            .attr("x", (j * bbox.width ) / density)//TODO sort
                            .attr("width", bbox.width / density)
                            .attr("y", 0)
                            .attr("height", bbox.height)
                            .attr("fill", colorScale(value))//填充颜色
                            .attr("clip-path", "url(#clippath" + provinces[i].id + ")");
                    }
                }

                sel.append('path')
                    .attr('d', path(provinces[i]))
                    .attr("fill", "url(#" + "pat" + d.id + ")")
                    .attr('fill-opacity', '1.0');
            }

            {//处理并生成并绘制最大值
                var temp = maxNormalValue * region;//+ y;
                var bbox = Snap.path.getBBox(path(provinces[indexOfProv]));
                var tempBarG = d3.selectAll("#tempBar" + provinces[indexOfProv].id);
                tempBarG.append("rect")
                    .attr("id", "tempbarRectId" + indexMax)
                    .attr("x", (indexMax * bbox.width ) / density)//TODO sort
                    .attr("width", bbox.width / density)
                    .attr("y", 0)
                    .attr("height", bbox.height)
                    .attr("fill", colorScale(temp))//填充颜色
                    .attr("clip-path", "url(#clippath" + provinces[indexOfProv].id + ")");
                console.log("测试数据位置:"+provinces[indexOfProv].id+":"+indexMax+":数值:"+temp+":length"+density+":"+region);
                sel.append('path')
                    .attr('d', path(provinces[indexOfProv]))
                    .attr("fill", "url(#" + "pat" + provinces[indexOfProv].id + ")")
                    .attr('fill-opacity', '1.0');
            }

            {//根据全局属性,绘制
                if(!isGlobal) {
                    var bbox = Snap.path.getBBox(path(provinces[indexOfProv]));
                    sel.append("rect")
                        .attr("x", -10)//TODO sort
                        .attr("width", bbox.width+20)
                        .attr("y", -10)
                        .attr("height", bbox.height + 20)
                        .attr("stroke", "#000000")
                        .attr("stroke-width", 2)
                        .attr("fill", colorScale(temp))//填充颜色
                        .attr("fill-opacity", 0)
                        .attr("transform", "translate(" + bbox.x + "," + bbox.y + ")");
                }
            }

            for (var i = 0; i < provinces.length; i++) {
                var d = provinces[i];
                var bbox = Snap.path.getBBox(path(provinces[i]));
                //添加一个影子rect,用来支持交互;这样鼠标移入矩形框,光标会发生变化
                var tempBarGShadow = sel.append("g")
                    .attr("id", "tempBarShadow" + provinces[i].id)
                    .attr("width", bbox.width)
                    .attr("height", bbox.height)
                    .attr("cursor", "pointer")
                    .attr("transform", "translate(" + bbox.x + "," + bbox.y + ")");

                for (var j = 0; j < density; j++) {
                    tempBarGShadow.append("rect")
                        .attr("id", "tempbarshadowRectId" + j)
                        .attr("x", (j * bbox.width ) / density)//TODO sort
                        .attr("width", bbox.width / density)
                        .attr("y", 0)
                        .attr("height", bbox.height)
                        .attr("fill", "rgba(1,0,0,0)")
                        .attr("filter", "grayscale(100%)")
                        .attr("clip-path", "url(#clippath" + provinces[i].id + ")")

                        .on("mouseout", function () {
                            //var filterId = function(ids){
                            //    return ids.substr(19);
                            //};
                            //var id = "tempbarRectId"+filterId(this.id);
                            //d3.selectAll("rect").attr("filter", function(){
                            //    return "";
                            //});
                        })
                        .on("mousedown", function () {
                            //console.log("mouse down");
                            var filterId = function(ids){
                                return ids.substr(19);
                            };
                            //var id = "tempbarRectId"+filterId(this.id);
                            //d3.selectAll("rect").attr("filter", function(){
                            //    if(this.id.startsWith("tempbarRectId") && this.id != id)
                            //        return "url(#desaturate)";
                            //    else if(this.id.startsWith("tempbarRectId"))
                            //        return "";
                            //});

                            var clip = this.getAttribute("clip-path");
                            var selectedProv = clip.substring(13,clip.length-1);
                            //在这里记录了实验者点击的省份和index
                            console.log("选中位置:"+ selectedProv+":"+filterId(this.id));
                            console.log("------");
                            //TODO 记录结果
                            nextTrial();

                        })
                        .on("mouseover", function () {
                            //console.log("I can see you!");
                        });
                }

            }
        });
}
