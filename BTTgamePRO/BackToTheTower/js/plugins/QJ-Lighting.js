//==========================================================
// RPG Maker MV QJ-Lighting.js
//==========================================================
/*:
 * @plugindesc Light and Shadows [V1.0 Beta] 2022-2-8
 * @author Qiu Jiu
 *
 *
 * @help
 * QJ-Lighting.js
 * ===============================================================================
 * 一.插件基础说明
 * ===============================================================================
 * 1.插件结构(逻辑结构,并非实际的图层结构)
 *
 *
 * ========================
 * 遮挡层(地图遮罩/黑色部分)
 * ========================
 *   ^
 *   |
 *   |          ============================
 *   |       -->简易灯光(用于区域灯光/定时灯光)
 * =====    /   ============================        ======================
 * 灯光层--<                                      -->实时阴影(地形或者区域)
 * =====    \   ======================          /   ======================
 *           -->完整灯光(用于事件/玩家)----------<    
 *              ======================          \   =============
 *                                               -->事件/玩家阴影
 *                                                  =============
 *
 *
 * 2.灯光总共分为两种：完整灯光和简易灯光。
 *   完整灯光：|有完整的灯光参数，可以产生实时阴影和事件阴影|消耗资源比较多，数量上限低|只能绑定在玩家或者事件身上    |
 *   简易灯光：|只有基础的灯光参数，不可以产生阴影         |消耗资源少，数量上限高    |只能绑定在指定位置(区域或地形)|
 *   ***在以后的版本中，可以使用弹幕插件(QJ-Bullet)也可以将上述两种灯光绑定在弹幕上，可以通过操控弹幕的移动来控制灯光的行为***
 * 3.要创建一个 完整灯光 ,必须首先在右方的插件参数"灯光预设数据"中设置一个灯光,然后此灯光便可(且只能)依照"灯光编号"来绑定在事件或者
 *   玩家身上.<<<仅仅能绑定在玩家或者事件上>>>
 *   (1)要绑定在玩家身上时,可以在右方插件参数"玩家初始灯光"中写上玩家最开始时所需要设置的灯光编号.游戏运行时要改变的话,就使用
 *   下方指定的脚本指令.
 *   (2)要绑定在事件身上时,需将该事件的某个事件页的第一个指令设置为"注释",且在该注释指令中写下方"二.事件注释"中的文字.
 *   不同的事件页可以设置不同的灯光,切换事件页后对应的灯光也会重新加载,故而:在游戏运行时想要修改事件的灯光,可以使用独立开关
 *   来切换事件页,从而改变灯光.
 *   (3)灯光的图片在数据库中设置后,会在游戏载入时进行预加载,可以提高系统稳定性,大幅提高效率.
 *      灯光图片放在img/lights下.设定的灯光图片名前面加上$符号时,灯光图片将被横向分为四行,每一行分别代表此
 *      事件/玩家朝向 下 左 右 上 时的灯光图片.
 *      灯光图片名后面可以加上 [总帧数,间隔时间] ,灯光图片将被纵向分为"总帧数"格,每隔"间隔时间"帧,灯光图片就
 *      会对应着动态变化.
 * 4.要创建一个 简易灯光，需在右方插件参数中"简易灯光数据"中设置灯光数据。
 *   可在“区域灯光”中将指定编号的简易灯光绑定在区域上，这样所有的该区域均会生成一个灯光.
 *   或者使用脚本指令在指定地方生成一个临时灯光，具体请查看 三.脚本指令 中的 5.定时简易灯光.
 * 5.地图中的阴影有两种:区域实时阴影和事件阴影。
 *   (1)区域实时阴影:
 *      区域实时阴影是指以某个区域的正方形块为图形进行投影，投射的点只能是这个正方形的四个角，此功能与大部分灯光插件的实时阴影功能
 *      相同。
 *      区域上方也可以显示各种形状的纯色遮罩，此功能主要是为了做"屋顶"的效果。灵活使用此效果可以制作其他灯光插件所说的"多高度阴影"
 *      (multi-height shadows)的效果。如果不想设置纯色遮罩，则将遮罩的颜色设置为白色(#ffffff).
 *      纯色遮罩的形状除了预设的那些外也可以自己写，但是此功能稍显复杂。
 *
 *      形状的基础设定方式是在数组中写各个点的对象。点的基础坐标为该块的左上角。
 *      例如 [{t:0,x:0,y:0},{t:0,x:48,y:0},{t:0,x:48,y:48},{t:0,x:0,y:48}]
 *      就代表着从(0,0)点画横线到(48,0)，再画横线到(48,48)，再画横线到(0,48)，最后首位相连，然后在画成的轨迹中进行涂色。
 *      其中x和y分别代表着相对于"该块的左上角"的坐标，t代表此点到下一个点的绘制方式。
 *      t的值和对应的绘制方式:
 *          0直线
 *          1顺时针画圆弧(朝外部)
 *          2顺时针画圆弧(朝内部)
 *          3逆时针画圆弧(朝外部)
 *          4逆时针画圆弧(朝内部)
 *          5将此点与初始点相连并在生成的图形中涂色，然后另开新的起始点画下一个部分
 *
 *   (2)事件阴影:
 *      可以指定某个光源可以让事件产生投影，然后可以指定哪个事件可以产生投影。
 *      某个光源是否可以让事件产生投影，得在插件参数的"灯光预设"中设定。
 *      事件能否产生投影得在某个事件的某个事件页的注释中写对应指令，具体可查看  二.事件注释  中的  3.事件阴影设置。
 *      事件是否默认产生阴影可以在右方的插件参数中的"默认开启事件阴影"中设定。
 *
 *      队友和领队(玩家)均可以产生阴影，队友的阴影参数与玩家相同.
 *
 * 6.灯光数据后面加*的数据,均可使用如下格式的字符串来设计动态变化效果(类似于设置关键帧):[!!!!!!!!!!!!!!!!!!!!特别重要!!!!!!!!!!!!!!!!!!!!]
 *   持续时间|对应值~持续时间|对应值~持续时间|对应值
 *   例如设置灯光的不透明度(0-1,1为最明亮)时,若写(不加空格,不加引号,不加逗号) 60|0.2~60|0.6~60|1 ,
 *      那么该灯光的不透明度在0-60帧时是0.2,60-120帧时是0.6,120-180帧时是1,然后 进行循环 .
 *   分割 持续时间 和 对应值的是符号|,除了|外,也可以使用/或者%.
 *   |代表到达该时间段内时,该数据的值瞬间变成对应值.例如50|0.5~10|1,该数据在第50帧时会由0.5瞬间变成1,持续10帧后再瞬间变回0.5.
 *   /代表在此时间段内,该数据的值由上一个值线性变为该对应值.例如50|0.5~10/1~50|1~10/0.5,
 *      该数据在第50帧后,会在10帧内由0.5线性变为1,在第60到第110帧内一直是1,然后在接下来的10帧内再次由1线性渐变为0.5.然后进行循环.
 *   %与/同理,不过/代表线性渐变,%代表曲线渐变(圆).
 *   !!!注意!!!该格式的第一个 持续时间|对应值 中分割 持续时间 和 对应值的符号只能是|,不能是/或者%.因为此时没有初值供其进行变化.
 * ================================================================
 *
 *
 *
 * ===============================================================================
 * 二.事件注释(每个事件的事件页中第一个事件指令)
 * ===============================================================================
 * 1.基础注释,为事件设置光效:(Qiu Jiu Light Layer)
 *   <QJLL:id>
 *   id:在数据库中指定的灯光id.
 * ================================================================
 * 2.修改事件光效数据:(Qiu Jiu Light Layer)
 *   以<QJLL:id>设置的指定数据库中的数据为基础,设置该事件该事件页灯光的对应数据,注意,在此处不能修改光效图片。
 *   在此处没有写的数据则不能修改.
 *   <QJLL-scaleX:value>                     例如  <QJLL-scaleX:1>
 *   <QJLL-scaleY:value>                     例如  <QJLL-scaleY:1>
 *   <QJLL-tint:value>                       例如  <QJLL-tint:#ff00ff>
 *   <QJLL-offsetX:value>                    例如  <QJLL-offsetX:0>
 *   <QJLL-offsetY:value>                    例如  <QJLL-offsetY:0>
 *   <QJLL-dirOffsetX:value>                 例如  <QJLL-dirOffsetX:0~0~0~0>
 *   <QJLL-dirOffsetY:value>                 例如  <QJLL-dirOffsetY:0~0~0~0>
 *   <QJLL-opacity:value>                    例如  <QJLL-opacity:1>
 *   <QJLL-rotation:value>                   例如  <QJLL-rotation:0>
 *   <QJLL-rotationAuto:value>               例如  <QJLL-rotationAuto:0>
 *   <QJLL-dirRotation:value>                例如  <QJLL-dirRotation:0~0~0~0>
 *   <QJLL-shadowCharacter:false/true>       例如  <QJLL-shadowCharacter:false>
 *   <QJLL-shadowCharacterOffsetX:value>     例如  <QJLL-shadowCharacterOffsetX:0>
 *   <QJLL-shadowCharacterOffsetY:value>     例如  <QJLL-shadowCharacterOffsetY:0>
 *   <QJLL-shadowCharacterMaxOpacity:value>  例如  <QJLL-shadowCharacterMaxOpacity:1>
 *   <QJLL-shadowCharacterMaxDistance:value> 例如  <QJLL-shadowCharacterMaxDistance:150>
 * ================================================================
 * 3.事件阴影设置:(Qiu Jiu Character Shadow)
 *   设置事件的阴影,灯光属性shadowCharacter打开时,灯光便会投射该事件的阴影。
 *   <QJCS-status:false/true>:是否显示该事件的阴影.默认是false.需要手动设置来打开.例如<QJCS-status:true>.
 *   <QJCS-imgName:value>:阴影默认采用事件的当前行走图作为阴影,但若想重新设置对应的阴影,可以在此设置阴影图片.
 *      1.阴影图片也放在img/lights下.设定的阴影图片名前面加上$符号时,阴影图片将被横向分为四行,每一行分别代表此
 *      事件朝向 下 左 右 上 的阴影图片.
 *      2.阴影默认采用事件的当前行走图作为阴影时,影子会随事件/玩家的行走图的变化而变化,但若设置成固定的阴影图片,
 *      则阴影不会随着事件的行走图的变化而变化.
 *      3.系统会将行走图完全变成黑色.若想单独指定该事件阴影的颜色,可以使用<QJCS-tint:value>来指定颜色.
 *      4.！！！注意！！！阴影图片在这里指定后,还必须在插件参数的"阴影图片预载"中同样写上此图片名.
 *      此举的目的是使所有用到的光影图片都被预加载,提高系统稳定性,大幅提高效率.
 *   <QJCS-tint:value>:阴影颜色.例如<QJCS-tint:#000000>.
 *   <QJCS-opacity:value>:阴影不透明度.例如<QJCS-opacity:1>.
 *   <QJCS-offsetX:value>:阴影底部的x偏移.例如<QJCS-offsetX:0>.
 *   <QJCS-offsetY:value>:阴影底部的y偏移.例如<QJCS-offsetY:0>.
 *   <QJCS-offsetDirX:朝下~朝左~朝右~朝上>:朝各个方向时阴影底部的x偏移.例如<QJCS-offsetDirX:0~0~0~0>.
 *   <QJCS-offsetDirY:朝下~朝左~朝右~朝上>:朝各个方向时阴影底部的y偏移.例如<QJCS-offsetDirY:0~0~0~0>.
 *   <QJCS-model:value>:此事件投影的模式.默认为D[].不同字符对应的效果为:例如<QJCS-model:DM[48]>.
 *
 *      D[]影子只会根据光源与事件的方向进行旋转,不会有任何变形.适合行走图比较小,脚很小的人物.
 *      DM[value]同D[],且光源离事件越近,影子越影子越短.value代表影子与原图的大小比例为1:1时光源与事件的距离(像素值).一格为48.
 *          value适合写48.
 *      DW[value]同D[],且光源离事件越近,影子越影子越长.value代表影子与原图的大小比例为1:1时光源与事件的距离(像素值).一格为48.
 *          value适合写96.
 *
 *      B[]影子的底部不变化,但是影子会根据光源与事件的方向进行形变.当光源与影子在同一水平线上时,影子会变得很窄很窄.适合行走图比
 *          较大,很宽的门.
 *      BM[value]同B[],且光源离事件越近,影子越影子越短.value代表影子与原图的大小比例为1:1时光源与事件的距离(像素值).一格为48.
 *          value适合写48.
 *      BW[value]同B[],且光源离事件越近,影子越影子越长.value代表影子与原图的大小比例为1:1时光源与事件的距离(像素值).一格为48.
 *          value适合写96.
 *   <QJCS-yCut:value>:在原阴影图的基础上，将锚点上浮value个像素,然后切除锚点之下的图片。在QJCS-model的值为D[]或DM[]或DW[]时，
 *      此效果能使阴影的旋转更自然，value的默认值是0，建议写的值为24.:例如<QJCS-yCut:24>.
 * ================================================================
 *
 *
 *
 * ===============================================================================
 * 三.脚本指令
 * ===============================================================================
 * 1.打开或者关闭灯光效果.
 *   QJ.LL.open():打开光效.注意!若使用过QJ.LL.tint来将画面整体颜色调整为"#ffffff"(白色,相当于没有光效),那么使用此指令将无效!
 *      需先使用QJ.LL.tint来将画面整体颜色变为其他颜色.
 *   QJ.LL.close():关闭光效.
 * ================================================================
 * 2.调节画面整体的默认颜色.
 *   QJ.LL.tint(time,color):调节光效整体颜色.
 *      time:渐变时间,单位为帧,写0时瞬间变化.
 *      color:目标颜色.
 *   若原本光效就关闭着,那么系统会自动打开光效,且光效颜色将从"#ffffff"渐变为目标颜色(color).
 *   同样地，若目标颜色(color)为"#ffffff"，系统会在渐变完后自动关闭光效。
 * ================================================================
 * 3.重设玩家光效.(set player light -> spl)
 *   QJ.LL.splHide():暂时隐藏玩家灯光数据.
 *   QJ.LL.splShow():打开玩家灯光数据.
 *   QJ.LL.spl(lightId):完全重设（刷新）灯光数据,写null以删除玩家灯光。
 *   QJ.LL.splScaleX(value):重设当前灯光的x缩放数据。
 *   QJ.LL.splScaleY(value):重设当前灯光的y缩放数据。
 *   QJ.LL.splTint(value):重设当前灯光的色调。
 *   QJ.LL.splOffsetX(value):重设当前灯光的x偏移。
 *   QJ.LL.splOffsetY(value):重设当前灯光的y偏移。
 *   QJ.LL.splDirOffsetX(value):重设当前灯光的x朝向偏移。
 *   QJ.LL.splDirOffsetY(value):重设当前灯光的y朝向偏移。
 *   QJ.LL.splOpacity(value):重设当前灯光的不透明度。
 *   QJ.LL.splRotation(value):重设当前灯光的角度。
 *   QJ.LL.splDirRotation(value):重设当前灯光的朝向角度。
 *   （其余诸如imgName等的数据只能通过QJ.LL.spl(lightId)重设.）
 * ================================================================
 * 4.重设玩家阴影.(set player shadow -> sps)
 *   QJ.LL.spsStatus(false/true):关闭/打开玩家阴影.
 *   QJ.LL.spsImgName(value):重设玩家阴影图片,使用QJ.LL.imgName("")或者QJ.LL.imgName(null)来使用玩家行走图作为阴影.
 *   QJ.LL.spsTint(value):重设玩家阴影色调.
 *   QJ.LL.spsOpacity(value):重设玩家阴影不透明度.
 *   QJ.LL.spsOffsetX(value):重设玩家阴影x偏移.
 *   QJ.LL.spsOffsetY(value):重设玩家阴影y偏移.
 *   QJ.LL.spsOffsetDirX(朝下~朝左~朝右~朝上):重设玩家阴影x朝向偏移.
 *   QJ.LL.spsOffsetDirY(朝下~朝左~朝右~朝上):重设玩家阴影y朝向偏移.
 *   QJ.LL.spsModel(value):重设玩家阴影模式.
 *   QJ.LL.spsYCut(value):重设玩家阴影的剪切.
 * ================================================================
 * 5.定时简易灯光
 *   QJ.LL.tempLight(lightId,during,x,y)在指定位置生成一个定时消失的灯光.
 *      lightId:简易灯光编号,指插件参数的 简易灯光数据 中设置的灯光.
 *      during:存在的时间，单位为帧，写-1时代表永远存在.
 *      x/y:显示的位置，单位为像素.
 * ================================================================
 *
 *
 *
 * ===============================================================================
 * 四.图块备注(在数据库-图块-备注中写的数据，可用于使用当前图块的地图)
 * ===============================================================================
 * 1.有时候我们感觉使用区域来制作实时阴影/遮盖有点麻烦，要大范围地设置墙壁，则需要为每一个绘制了相同图块的格子
 *   都再绘制一次区域.此时我们可以使用“地形”来简化此步骤。（Qiu Jiu Terraintag Shadow）
 *   在地图图块的备注中写<QJTS-1:value>或<QJTS-2:value>或……或<QJTS-7:value>（地形最大为7）
 *   则可以使这个地图图块的某个地形拥有id为value的区域的阴影效果。
 *   例如在插件参数的“区域阴影设置”中指定了区域255的数据，若在某个地图图块的备注中写<QJTS-1:255>，则可以使当前地图图块地形为
 *   1的图块有区域255的相关阴影效果.
 *   ***当一个地方既有地形所代指的区域效果，本身又设置了区域，则以区域为主***
 * ================================================================
 * 2.有时候我们要让一大片区域的每一格都生成灯光，若感觉使用区域比较麻烦，可使用<QJL-1:value>等指令让某个地形生成和id为
 *   value一样的区域生成的灯光相同的灯光.
 *   例如在插件参数的“简易灯光预设”中指定了区域100的数据，若在某个地图图块的备注中写<QJL-2:100>，则可以使当前地图图块地形为
 *   2的图块有区域100的灯光效果.
 *   ***当一个地方既有地形所代指的区域效果，本身又设置了区域，则以区域为主***
 * ================================================================
 *
 *
 * 
 * ===============================================================================
 * 五.地图备注
 * ===============================================================================
 *
 *
 *
 *
 *
 *
 * @param lightPreset
 * @type struct<presetData>[]
 * @text 灯光预设数据
 * @desc 灯光预设数据
 * @default []
 *
 * @param miniLights
 * @type struct<miniLightsData>[]
 * @text 简易灯光预设数据
 * @desc 简易灯光预设数据.
 * @default []
 *
 * @param region
 * @type struct<regionData>[]
 * @text 区域阴影设置
 * @desc 设置区域的阴影效果.
 * @default []
 *
 * @param regionLights
 * @type struct<regionLightsData>[]
 * @text 区域灯光设置
 * @desc 区域灯光设置，在某区域上生成指定id的简易灯光
 * @default []
 *
 * @param characterShadowList
 * @type file[]
 * @dir img/lights
 * @text 事件阴影图片列表
 * @desc 事件阴影图片列表，要设置事件的特殊阴影时，必须在此写上文件名进行预加载.
 * @default []
 *
 * @param characterShadowDefault
 * @type struct<characterShadowDefaultDetail>
 * @text 事件阴影默认值
 * @desc 事件阴影默认值
 * @default {"status":"false","tint":"#000000","opacity":"1","offsetX":"0","offsetY":"0","offsetDirX":"0~0~0~0","offsetDirY":"0~0~0~0","model":"D[]","yCut":"0"}
 *
 * @param playerShadowDefault
 * @type struct<playerShadowDefaultDetail>
 * @text 玩家阴影默认值
 * @desc 玩家阴影默认值
 * @default {"status":"false","tint":"#000000","opacity":"1","offsetX":"0","offsetY":"0","offsetDirX":"0~0~0~0","offsetDirY":"0~0~0~0","model":"D[]","yCut":"0"}
 *
 * @param playerInitLight
 * @type text
 * @text 玩家初始灯光
 * @desc 玩家初始灯光
 * @default test
 *
 * @param maskInitColor
 * @type text
 * @text 背景初始颜色
 * @desc 背景初始颜色,建议的值为：特黑#191919 较黑#202020 一般#292929 较明#393939 明#555555 特明#666666
 * @default #292929
 *
 * @param hidePrimordialShadow
 * @type boolean
 * @text 隐藏系统原生阴影
 * @desc 隐藏系统原生阴影
 * @default true
 *
 * @param defaultOpen
 * @type boolean
 * @text 默认打开灯光效果
 * @desc 默认打开灯光效果
 * @default true
 *
 *
 *
 *
 *
*/
/*~struct~presetData:
 *
 * @param ================
 *
 * @param id
 * @type text
 * @text 灯光编号
 * @desc 灯光编号
 * @default test
 *
 * @param ================
 *
 * @param imgName
 * @type file
 * @dir img/lights
 * @text 灯光图像
 * @desc 灯光图像
 * @default circle
 *
 * @param ================
 *
 * @param scaleX
 * @type text
 * @text x放大率*
 * @desc x放大率,1为标准大小.
 * @default 1
 *
 * @param scaleY
 * @type text
 * @text y放大率*
 * @desc y放大率,1为标准大小.
 * @default 1
 *
 * @param ================
 *
 * @param tint
 * @type text
 * @text 附加颜色*
 * @desc 附加颜色.
 * @default #FFFFFF
 *
 * @param ================
 *
 * @param offsetX
 * @type text
 * @text 基础X偏移*
 * @desc 基础X偏移.
 * @default 0
 *
 * @param offsetY
 * @type text
 * @text 基础y偏移*
 * @desc 基础y偏移.
 * @default 0
 *
 * @param dirOffsetX
 * @type text
 * @text 方向附加x偏移
 * @desc 方向附加x偏移,指定当当前光效绑定事件时,光效的位置随事件的朝向变化而变化.格式为 朝下时的x偏移~朝左~朝右~朝上.
 * @default 0~0~0~0
 *
 * @param dirOffsetY
 * @type text
 * @text 方向附加y偏移
 * @desc 方向附加y偏移,指定当当前光效绑定事件时,光效的位置随事件的朝向变化而变化.格式为 朝下时的y偏移~朝左~朝右~朝上.
 * @default 0~0~0~0
 *
 * @param ================
 *
 * @param opacity
 * @type text
 * @text 不透明度*
 * @desc 不透明度,写0-1的数字.
 * @default 1
 *
 * @param ================
 *
 * @param rotation
 * @type text
 * @text 角度*
 * @desc 角度,写0-360的数字.
 * @default 0
 *
 * @param dirRotation
 * @type text
 * @text 方向角度
 * @desc 指定光效的角度随事件的朝向变化而变化.格式为 朝下时的转角~朝左~朝右~朝上.例如:180~270~90~0
 * @default 0~0~0~0
 *
 * @param dirRotationFrame
 * @type text
 * @text 方向角改变速度
 * @desc 度每帧.在事件的朝向改变时，若dirRotation有对应的值，则动态变化dirRotation,建议写10
 * @default 0
 *
 * @param rotationAuto
 * @type text
 * @text 旋转速度
 * @desc 度每帧.旋转速度,在角度和方向角度的前提下,每帧为其增加一定的角度.
 * @default 0
 *
 * @param ================
 *
 * @param shadowWall
 * @type boolean
 * @text 是否显示区域投影
 * @desc 是否显示区域投影
 * @default false
 *
 * @param ================
 *
 * @param shadowCharacter
 * @type boolean
 * @text 是否显示事件投影
 * @desc 是否显示事件投影
 * @default false
 *
 * @param shadowCharacterOffsetX
 * @type text
 * @text 投影点x偏移
 * @desc 投影点x偏移
 * @default 0
 *
 * @param shadowCharacterOffsetY
 * @type text
 * @text 投影点y偏移
 * @desc 投影点y偏移
 * @default 0
 *
 * @param shadowCharacterMaxOpacity
 * @type text
 * @text 事件投影最大不透明度
 * @desc 事件投影最大不透明度
 * @default 0.6
 *
 * @param shadowCharacterMaxDistance
 * @type text
 * @text 事件投影最大半径
 * @desc 事件投影最大半径
 * @default 150
 *
 * @param shadowCharacterShakeX
 * @type select
 * @text 事件投影抖动
 * @desc 事件投影抖动的纵向抖动(实际为纵向放大率,可同标*的数据一样自由设计)
 * @default 1
 * @option 不抖动
 * @value 1
 * @option 轻微抖动
 * @value 40|1~5/1.01~5/1~10|1~5/1.01~5/1
 * @option 一般抖动
 * @value 40|1~5/1.02~5/1~10|1~5/1.02~5/1
 * @option 较强烈抖动
 * @value 40|1~5/1.03~5/1~10|1~5/1.03~5/1
 * @option 强烈抖动
 * @value 40|1~5/1.04~5/1~10|1~5/1.04~5/1
 *
 * @param ================
 *
 * 
 *
*/
/*~struct~regionLightsData:
 *
 * @param ================
 *
 * @param id
 * @type number
 * @min 1
 * @max 255
 * @text 区域id
 * @desc 区域id
 * @default 1
 *
 * @param lightId
 * @type text
 * @text 简易灯光id
 * @desc 简易灯光id
 * @default 1
 *
 * @param ================
 *
 * @param showCondition
 * @type select
 * @text 显示条件
 * @desc 显示条件
 * @default 0
 * @option 一直显示
 * @value 0
 * @option 玩家身处此区域时显示
 * @value 1
 * @option 玩家身处此格时显示
 * @value 2
 *
 * @param showConditionExtra
 * @type note
 * @text 显示条件扩展
 * @desc 显示条件扩展,在此处写js代码来返回(return)决定是否显示的布尔值，使用ifShow获取上方“显示条件”的判定结果.
 * @default ""
 *
 *
 * @param ================
 *
*/
/*~struct~miniLightsData:
 *
 * @param ================
 *
 * @param id
 * @type text
 * @text 简易灯光id
 * @desc 简易灯光id
 * @default 1
 *
 * @param ================
 *
 * @param imgName
 * @type file
 * @dir img/lights
 * @text 灯光图像
 * @desc 灯光图像
 * @default circle
 *
 * @param ================
 *
 * @param scaleX
 * @type text
 * @text x放大率*
 * @desc x放大率,1为标准大小.
 * @default 1
 *
 * @param scaleY
 * @type text
 * @text y放大率*
 * @desc y放大率,1为标准大小.
 * @default 1
 *
 * @param ================
 *
 * @param tint
 * @type text
 * @text 附加颜色*
 * @desc 附加颜色.
 * @default #FFFFFF
 *
 * @param ================
 *
 * @param offsetX
 * @type text
 * @text 基础X偏移*
 * @desc 基础X偏移.
 * @default 0
 *
 * @param offsetY
 * @type text
 * @text 基础y偏移*
 * @desc 基础y偏移.
 * @default 0
 *
 * @param ================
 *
 * @param opacity
 * @type text
 * @text 不透明度*
 * @desc 不透明度,写0-1的数字.
 * @default 1
 *
 * @param ================
 *
 * @param rotation
 * @type text
 * @text 角度*
 * @desc 角度,写0-360的数字.
 * @default 0
 *
 * @param ================
 *
 * 
 *
*/
/*~struct~regionData:
 *
 * @param ================
 * @default 
 *
 * @param id
 * @type number
 * @min 1
 * @max 255
 * @text 区域id
 * @desc 区域id
 * @default 1
 *
 * @param ================
 *
 * @param rectOpacity
 * @type text
 * @text 遮挡阴影不透明度
 * @desc 上方遮挡不透明度,范围是0-1之间的小数.
 * @default 1
 *
 * @param rectTint
 * @type text
 * @text 遮挡阴影特殊颜色
 * @desc 遮挡阴影特殊颜色,#000000会让此区块有黑色遮挡,#ffffff会让此区块完全明亮
 * @default #000000
 *
 * @param rectShape
 * @type select
 * @text 遮挡阴影形状
 * @desc 遮挡阴影的颜色,除了可以选择外,也可以进行手动输入,请根据范例的格式来写.(0直线1顺圆弧正2顺圆弧逆3逆圆弧正4逆圆弧逆5新开原点)
 * @default [{t:0,x:0,y:0},{t:0,x:48,y:0},{t:0,x:48,y:48},{t:0,x:0,y:48}]
 * @option 不遮挡
 * @value []
 * @option 正方形(48*48)
 * @value [{t:0,x:0,y:0},{t:0,x:48,y:0},{t:0,x:48,y:48},{t:0,x:0,y:48}]
 * @option 中心正方形1/2(24*24)
 * @value [{t:0,x:12,y:12},{t:0,x:36,y:12},{t:0,x:36,y:36},{t:0,x:12,y:36}]
 * @option 圆形(48*48)
 * @value [{t:1,x:24,y:0,r:24},{t:1,x:24,y:48,r:24}]
 * @option 中心圆形1/2(48*48)
 * @value [{t:1,x:24,y:12,r:12},{t:1,x:24,y:36,r:12}]
 * @option 左上方三角(48*48)
 * @value [{t:0,x:0,y:0},{t:0,x:48,y:0},{t:0,x:0,y:48}]
 * @option 右上方三角(48*48)
 * @value [{t:0,x:0,y:0},{t:0,x:48,y:0},{t:0,x:48,y:48}]
 * @option 右下方三角(48*48)
 * @value [{t:0,x:48,y:0},{t:0,x:48,y:48},{t:0,x:0,y:48}]
 * @option 左下方三角(48*48)
 * @value [{t:0,x:0,y:0},{t:0,x:48,y:48},{t:0,x:0,y:48}]
 * @option 左上方1/4圆(48*48)
 * @value [{t:0,x:0,y:0},{t:1,x:48,y:0,r:48},{t:0,x:0,y:48}]
 * @option 右上方1/4圆(48*48)
 * @value [{t:0,x:48,y:0},{t:1,x:48,y:48,r:48},{t:0,x:0,y:0}]
 * @option 右下方1/4圆(48*48)
 * @value [{t:0,x:48,y:48},{t:1,x:0,y:48,r:48},{t:0,x:48,y:0}]
 * @option 左下方1/4圆(48*48)
 * @value [{t:0,x:0,y:48},{t:1,x:0,y:0,r:48},{t:0,x:48,y:48}]
 * @option 左上方三角1/2(24*24)
 * @value [{t:0,x:0,y:0},{t:0,x:24,y:0},{t:0,x:0,y:24}]
 * @option 右上方三角1/2(24*24)
 * @value [{t:0,x:24,y:0},{t:0,x:48,y:0},{t:0,x:48,y:24}]
 * @option 右下方三角1/2(24*24)
 * @value [{t:0,x:48,y:24},{t:0,x:48,y:48},{t:0,x:24,y:48}]
 * @option 左下方三角1/2(24*24)
 * @value [{t:0,x:0,y:24},{t:0,x:24,y:48},{t:0,x:0,y:48}]
 * @option 左上方1/4圆1/2(24*24)
 * @value [{t:0,x:0,y:0},{t:1,x:24,y:0,r:24},{t:0,x:0,y:24}]
 * @option 右上方1/4圆1/2(24*24)
 * @value [{t:0,x:48,y:0},{t:1,x:48,y:24,r:24},{t:0,x:24,y:0}]
 * @option 右下方1/4圆1/2(24*24)
 * @value [{t:0,x:48,y:48},{t:1,x:24,y:48,r:24},{t:0,x:48,y:24}]
 * @option 左下方1/4圆1/2(24*24)
 * @value [{t:0,x:0,y:48},{t:1,x:0,y:24,r:24},{t:0,x:24,y:48}]
 * @option 左方1/2圆(24*48)
 * @value [{t:0,x:0,y:0},{t:3,x:0,y:48,r:24},{t:0,x:0,y:0}]
 * @option 上方1/2圆(48*24)
 * @value [{t:0,x:48,y:0},{t:3,x:0,y:0,r:24},{t:0,x:48,y:0}]
 * @option 右方1/2圆(24*48)
 * @value [{t:0,x:48,y:48},{t:3,x:48,y:0,r:24},{t:0,x:48,y:48}]
 * @option 下方1/2圆(48*24)
 * @value [{t:0,x:0,y:48},{t:3,x:48,y:48,r:24},{t:0,x:0,y:48}]
 *
 * @param ================
 *
 * @param shadowShow
 * @type boolean
 * @text 实时阴影
 * @desc 是否产生实时阴影
 * @default false
 *
 * @param shadowHeight
 * @type number
 * @min 0
 * @max 8
 * @text 实时阴影高度
 * @desc 实时阴影显示的高度
 * @default 0
 *
 * @param shadowTint
 * @type text
 * @text 实时阴影颜色
 * @desc 实时阴影颜色。虽然预留了此参数，但是并不建议修改。
 * @default #000000
 *
 * @param ================
 *
*/
/*~struct~characterShadowDefaultDetail:
 *
 * @param status
 * @type boolean
 * @text 是否默认显示
 * @desc 是否默认显示
 * @default false
 *
 * @param tint
 * @type text
 * @text 阴影色调
 * @desc 阴影色调，#000000为黑色，#ffffff为白色.
 * @default #000000
 *
 * @param opacity
 * @type text
 * @text 阴影不透明度
 * @desc 阴影不透明度
 * @default 1
 *
 * @param offsetX
 * @type number
 * @text 阴影底部的x偏移
 * @desc 阴影底部的x偏移
 * @default 0
 *
 * @param offsetY
 * @type number
 * @text 阴影底部的y偏移
 * @desc 阴影底部的y偏移
 * @default 0
 *
 * @param offsetDirX
 * @type text
 * @text 朝各个方向时阴影底部的x偏移
 * @desc 朝各个方向时阴影底部的x偏移
 * @default 0~0~0~0
 *
 * @param offsetDirY
 * @type text
 * @text 朝各个方向时阴影底部的y偏移
 * @desc 朝各个方向时阴影底部的y偏移
 * @default 0~0~0~0
 *
 * @param model
 * @type text
 * @text 投影模式
 * @desc 投影模式
 * @default D[]
 *
 * @param yCut
 * @type text
 * @text 截取与上浮
 * @desc 截取与上浮
 * @default 0
 *
*/
/*~struct~playerShadowDefaultDetail:
 *
 * @param status
 * @type boolean
 * @text 是否默认显示
 * @desc 是否默认显示
 * @default false
 *
 * @param imgName
 * @type file
 * @dir img/lights
 * @text 影子图像
 * @desc 影子图像，留空则使用玩家的当前行走图作为影子.
 * @default 
 *
 * @param tint
 * @type text
 * @text 阴影色调
 * @desc 阴影色调，#000000为黑色，#ffffff为白色.
 * @default #000000
 *
 * @param opacity
 * @type text
 * @text 阴影不透明度
 * @desc 阴影不透明度
 * @default 1
 *
 * @param offsetX
 * @type number
 * @text 阴影底部的x偏移
 * @desc 阴影底部的x偏移
 * @default 0
 *
 * @param offsetY
 * @type number
 * @text 阴影底部的y偏移
 * @desc 阴影底部的y偏移
 * @default 0
 *
 * @param offsetDirX
 * @type text
 * @text 朝各个方向时阴影底部的x偏移
 * @desc 朝各个方向时阴影底部的x偏移
 * @default 0~0~0~0
 *
 * @param offsetDirY
 * @type text
 * @text 朝各个方向时阴影底部的y偏移
 * @desc 朝各个方向时阴影底部的y偏移
 * @default 0~0~0~0
 *
 * @param model
 * @type text
 * @text 投影模式
 * @desc 投影模式
 * @default D[]
 *
 * @param yCut
 * @type text
 * @text 截取与上浮
 * @desc 截取与上浮
 * @default 0
 *
*/
//==========================================================
//
//==========================================================
var QJ = QJ || {};
QJ.LL = QJ.LL || {};
var Imported = Imported || {};
Imported.QJLayerLight = true;
//==========================================================
//
//==========================================================
QJ.LL.globalText = [
"PIXI版本过低，请更新。",
"设定的灯光图像未加载成功。图像名: ",
"指定事件的阴影时，需将阴影图片名写在插件参数的 事件阴影列表 中。\n没有做此操作的事件的阴影名，事件id和地图id分别为:",
"未设置此灯光。此灯光的id为：",
"未设置此区域灯光。此灯光的id为：",
"在区域上设置了显示简易灯光，但是没有此id的简易灯光。区域和简易灯光id为：",
"使用QJ.LL.tempLight生成临时灯光，但是指定的要生成的简易灯光并未设置，要设置的简易灯光id为："
];
QJ.LL.error = (content)=>{throw new Error(content+".");}
//==========================================================
//
//==========================================================
if (Number(PIXI.VERSION[0])<4) {throw new Error(QJ.LL.globalText[0]);}
//==========================================================
//
//==========================================================
function QJFrameLight() {
    this.initialize.apply(this, arguments);
}
function Game_QJLightLayer() {
    this.initialize.apply(this, arguments);
}
function Game_QJLightLayerMini() {
    this.initialize.apply(this, arguments);
}
//==========================================================
//
//==========================================================
(()=>{const _0x52a267='QJ-Lighting';const _0x243bb3=PluginManager['parameters'](_0x52a267);const _0x1bedec=eval(_0x243bb3['hidePrimordialShadow']);const _0x37053e=eval(_0x243bb3['characterShadowList']);const _0x592c6b=JsonEx['parse'](_0x243bb3['characterShadowDefault']);const _0x31434d=JsonEx['parse'](_0x243bb3['playerShadowDefault']);const _0x1101cc={};const _0x1f1d34={};const _0xa6dd03={};const _0x19edd3={};const _0x2b8ad5={};const _0xbe1800={};const _0x34cb7d=0x30;const _0x54ffa6=0x60;let _0x2ebc77,_0x3fd8e5,_0x3f5f67,_0x41dc67,_0x1585a3,_0x7f3285,_0x1661f3,_0x512cb6;QJ['LL']['calculateAngleByTwoPoint']=function(_0x3f8574,_0x439500,_0x45ba0a,_0x57f32a){let _0x4dab76;if(_0x45ba0a>_0x3f8574&&_0x57f32a<_0x439500)_0x4dab76=-Math['atan']((_0x3f8574-_0x45ba0a)/(_0x439500-_0x57f32a));if(_0x45ba0a>_0x3f8574&&_0x57f32a>_0x439500)_0x4dab76=Math['PI']-Math['atan']((_0x3f8574-_0x45ba0a)/(_0x439500-_0x57f32a));if(_0x45ba0a<_0x3f8574&&_0x57f32a>_0x439500)_0x4dab76=Math['PI']-Math['atan']((_0x3f8574-_0x45ba0a)/(_0x439500-_0x57f32a));if(_0x45ba0a<_0x3f8574&&_0x57f32a<_0x439500)_0x4dab76=0x2*Math['PI']-Math['atan']((_0x3f8574-_0x45ba0a)/(_0x439500-_0x57f32a));if(_0x45ba0a==_0x3f8574&&_0x57f32a>_0x439500)_0x4dab76=Math['PI'];if(_0x45ba0a==_0x3f8574&&_0x57f32a<_0x439500)_0x4dab76=0x0;if(_0x45ba0a>_0x3f8574&&_0x57f32a==_0x439500)_0x4dab76=Math['PI']/0x2;if(_0x45ba0a<_0x3f8574&&_0x57f32a==_0x439500)_0x4dab76=Math['PI']*0x3/0x2;if(_0x45ba0a==_0x3f8574&&_0x57f32a==_0x439500)_0x4dab76=null;return _0x4dab76;};QJ['LL']['calculateShape']=function(_0x146dd9){if(!_0x146dd9||_0x146dd9['length']==0x0)return[];for(let _0x361b7b=0x0,_0xeff70=_0x146dd9['length'],_0xb5ab89,_0x54274e,_0x695ca4,_0x4e3ee7,_0x274516,_0x3cabf5,_0x170f35,_0x196667,_0x5eecef,_0x1548f7,_0x3a34a4,_0x175c93,_0x489314,_0xcf9ff8=_0x146dd9[0x0]['x'],_0x3cf746=_0x146dd9[0x0]['y'];_0x361b7b<_0xeff70;_0x361b7b++){if(_0x146dd9[_0x361b7b]['t']==0x0)continue;else if(_0x146dd9[_0x361b7b]['t']==0x5){_0xcf9ff8=_0x146dd9[_0x361b7b]['x'];_0x3cf746=_0x146dd9[_0x361b7b]['y'];continue;}_0x4e3ee7=_0x146dd9[_0x361b7b]['x'];_0x274516=_0x146dd9[_0x361b7b]['y'];_0x3cabf5=_0x146dd9[_0x361b7b+0x1]?_0x146dd9[_0x361b7b+0x1]['x']:_0xcf9ff8;_0x170f35=_0x146dd9[_0x361b7b+0x1]?_0x146dd9[_0x361b7b+0x1]['y']:_0x3cf746;_0x196667=_0x4e3ee7-_0x3cabf5;_0x5eecef=_0x274516-_0x170f35;_0x695ca4=_0x146dd9[_0x361b7b]['r'];_0xb5ab89=(_0x4e3ee7+_0x3cabf5)/0x2;_0x54274e=(_0x274516+_0x170f35)/0x2;_0x175c93=Math['sqrt'](_0x196667*_0x196667+_0x5eecef*_0x5eecef);_0x489314=Math['sqrt'](_0x695ca4*_0x695ca4-_0x175c93*_0x175c93/0x4);if(_0x146dd9[_0x361b7b]['t']==0x1){_0x146dd9[_0x361b7b]['cx']=_0xb5ab89+_0x489314*(_0x5eecef/_0x175c93||0x0);_0x146dd9[_0x361b7b]['cy']=_0x54274e-_0x489314*(_0x196667/_0x175c93||0x0);_0x146dd9[_0x361b7b]['ccw']=![];}else if(_0x146dd9[_0x361b7b]['t']==0x2){_0x146dd9[_0x361b7b]['cx']=_0xb5ab89+_0x489314*(_0x5eecef/_0x175c93||0x0);_0x146dd9[_0x361b7b]['cy']=_0x54274e-_0x489314*(_0x196667/_0x175c93||0x0);_0x146dd9[_0x361b7b]['ccw']=![];}else if(_0x146dd9[_0x361b7b]['t']==0x3){_0x146dd9[_0x361b7b]['cx']=_0xb5ab89-_0x489314*(_0x5eecef/_0x175c93||0x0);_0x146dd9[_0x361b7b]['cy']=_0x54274e+_0x489314*(_0x196667/_0x175c93||0x0);_0x146dd9[_0x361b7b]['ccw']=!![];}else if(_0x146dd9[_0x361b7b]['t']==0x4){_0x146dd9[_0x361b7b]['cx']=_0xb5ab89-_0x489314*(_0x5eecef/_0x175c93||0x0);_0x146dd9[_0x361b7b]['cy']=_0x54274e+_0x489314*(_0x196667/_0x175c93||0x0);_0x146dd9[_0x361b7b]['ccw']=!![];}_0x146dd9[_0x361b7b]['cx']=Math['round'](_0x146dd9[_0x361b7b]['cx']);_0x146dd9[_0x361b7b]['cy']=Math['round'](_0x146dd9[_0x361b7b]['cy']);_0x146dd9[_0x361b7b]['sa']=QJ['LL']['calculateAngleByTwoPoint'](_0x146dd9[_0x361b7b]['cx'],_0x146dd9[_0x361b7b]['cy'],_0x4e3ee7,_0x274516)-Math['PI']/0x2;_0x146dd9[_0x361b7b]['ea']=QJ['LL']['calculateAngleByTwoPoint'](_0x146dd9[_0x361b7b]['cx'],_0x146dd9[_0x361b7b]['cy'],_0x3cabf5,_0x170f35)-Math['PI']/0x2;}return _0x146dd9;};QJ['LL']['calculateDirAttribute']=function(_0x1712c7,_0x264eaa,_0x566c29){try{let _0x4a5560=_0x1712c7[_0x264eaa]['split']('~');_0x1712c7[_0x264eaa]=[0x0,0x0,Number(_0x4a5560[0x0])*(_0x566c29?Math['PI']/0xb4:0x1),0x0,Number(_0x4a5560[0x1])*(_0x566c29?Math['PI']/0xb4:0x1),0x0,Number(_0x4a5560[0x2])*(_0x566c29?Math['PI']/0xb4:0x1),0x0,Number(_0x4a5560[0x3])*(_0x566c29?Math['PI']/0xb4:0x1),0x0];}catch(_0x1c2ddf){QJ['LL']['error'](_0x264eaa+'\x20can\x20not\x20be\x20'+_0x1712c7[_0x264eaa]);}};QJ['LL']['getCSModel']=function(_0x4201f2){if(_0x4201f2[0x0]=='D'){if(_0x4201f2[0x1]=='['){return[0x0,0x0];}else if(_0x4201f2[0x1]=='M'){return[0x0,0x1,Number(_0x4201f2['match'](/DM\[([^\]]+)\]/)[0x1])];}else if(_0x4201f2[0x1]=='W'){return[0x0,0x2,Number(_0x4201f2['match'](/DW\[([^\]]+)\]/)[0x1])];}}else if(_0x4201f2[0x0]=='B'){if(_0x4201f2[0x1]=='['){return[0x1,0x0];}else if(_0x4201f2[0x1]=='M'){return[0x1,0x1,Number(_0x4201f2['match'](/BM\[([^\]]+)\]/)[0x1])];}else if(_0x4201f2[0x1]=='W'){return[0x1,0x2,Number(_0x4201f2['match'](/BW\[([^\]]+)\]/)[0x1])];}}return[0x0,0x0];};(()=>{let _0x1f36af;_0x592c6b['status']=eval(_0x592c6b['status']);_0x592c6b['opacity']=Number(_0x592c6b['opacity']);_0x592c6b['offsetX']=Number(_0x592c6b['offsetX']);_0x592c6b['offsetY']=Number(_0x592c6b['offsetY']);_0x592c6b['yCut']=Number(_0x592c6b['yCut']);_0x31434d['status']=eval(_0x31434d['status']);_0x31434d['opacity']=Number(_0x31434d['opacity']);_0x31434d['offsetX']=Number(_0x31434d['offsetX']);_0x31434d['offsetY']=Number(_0x31434d['offsetY']);_0x31434d['yCut']=Number(_0x31434d['yCut']);QJ['LL']['calculateDirAttribute'](_0x31434d,'offsetDirX');QJ['LL']['calculateDirAttribute'](_0x31434d,'offsetDirY');_0x31434d['model']=QJ['LL']['getCSModel'](_0x31434d['model']);let _0xe53cdb=eval(_0x243bb3['region']);for(let _0x155849 of _0xe53cdb){_0x1f36af=JsonEx['parse'](_0x155849);_0x1f36af['id']=Number(_0x1f36af['id']);_0x1f36af['rectOpacity']=Number(_0x1f36af['rectOpacity']);_0x1f36af['rectTint']=_0x1f36af['rectTint'];_0x1f36af['rectShape']=QJ['LL']['calculateShape'](eval(_0x1f36af['rectShape']));_0x1f36af['shadowShow']=eval(_0x1f36af['shadowShow']);_0x1f36af['shadowOpacity']=0x1;_0x1f36af['shadowTint']=PIXI['utils']['hex2rgb'](Number('0x'+_0x1f36af['shadowTint']['substr'](0x1)));_0x1f36af['shadowHeight']=Number(_0x1f36af['shadowHeight']);_0x2b8ad5[_0x1f36af['id']]=_0x1f36af;}let _0x26a7a3=eval(_0x243bb3['lightPreset']);for(let _0x23ff5c of _0x26a7a3){_0x1f36af=JsonEx['parse'](_0x23ff5c);_0x1f36af['character']=null;_0x1f36af['anchorX']=0.5;_0x1f36af['anchorY']=0.5;QJ['LL']['calculateDirAttribute'](_0x1f36af,'dirOffsetX');QJ['LL']['calculateDirAttribute'](_0x1f36af,'dirOffsetY');QJ['LL']['calculateDirAttribute'](_0x1f36af,'dirRotation',!![]);_0xbe1800[_0x1f36af['imgName']]=null;_0x1f36af['dirRotationFrame']=Number(_0x1f36af['dirRotationFrame']);_0x1f36af['rotationAuto']=Number(_0x1f36af['rotationAuto'])*Math['PI']/0xb4;_0x1f36af['shadowCharacter']=eval(_0x1f36af['shadowCharacter']);_0x1f36af['shadowWall']=eval(_0x1f36af['shadowWall']);_0x1f36af['shadowCharacterOffsetX']=Number(_0x1f36af['shadowCharacterOffsetX']);_0x1f36af['shadowCharacterOffsetY']=Number(_0x1f36af['shadowCharacterOffsetY']);_0x1f36af['shadowCharacterMaxOpacity']=Number(_0x1f36af['shadowCharacterMaxOpacity']);_0x1f36af['shadowCharacterMaxDistance']=Number(_0x1f36af['shadowCharacterMaxDistance']);_0x1f1d34[_0x1f36af['id']]=_0x1f36af;}_0x26a7a3=eval(_0x243bb3['miniLights']);for(let _0x5bf173 of _0x26a7a3){_0x1f36af=JsonEx['parse'](_0x5bf173);_0xbe1800[_0x1f36af['imgName']]=null;_0x1f36af['anchorX']=0.5;_0x1f36af['anchorY']=0.5;_0x1f36af['during']=-0x1;_0xa6dd03[_0x1f36af['id']]=_0x1f36af;}_0x26a7a3=eval(_0x243bb3['regionLights']);for(let _0x317b54 of _0x26a7a3){_0x1f36af=JsonEx['parse'](_0x317b54);if(_0xa6dd03[_0x1f36af['lightId']]){_0x19edd3[Number(_0x1f36af['id'])]=JsonEx['makeDeepCopy'](_0xa6dd03[_0x1f36af['lightId']]);_0x19edd3[Number(_0x1f36af['id'])]['showCondition']=Number(_0x1f36af['showCondition']);_0x19edd3[Number(_0x1f36af['id'])]['showConditionExtra']=_0x1f36af['showConditionExtra']['length']>0x2?eval('(function(ifShow){'+eval(_0x1f36af['showConditionExtra'])+'})'):null;}else{QJ['LL']['error'](QJ['LL']['globalText'][0x5]+id+'\x20'+_0x1f36af['lightId']);}}})();if(_0x1bedec){ShaderTilemap['prototype']['_drawShadow']=function(_0x2890f1,_0x5be9de,_0x11314c,_0x25f8f1){};Tilemap['prototype']['_drawShadow']=function(_0x4df72e,_0xaf5c18,_0x23ac9d,_0x583533){};}const _0x16d72e=Scene_Boot['loadSystemImages'];Scene_Boot['loadSystemImages']=function(){_0x16d72e['call'](this);_0x1585a3=Graphics['width'];_0x7f3285=Graphics['height'];_0x1661f3=Math['floor'](_0x1585a3+_0x54ffa6);_0x512cb6=Math['floor'](_0x7f3285+_0x54ffa6);for(let _0x282219 in _0xbe1800){_0xbe1800[_0x282219]=ImageManager['loadLightQJLL'](_0x282219);}for(let _0x2385a6 of _0x37053e){_0x1101cc[_0x2385a6]=ImageManager['loadLightQJLL'](_0x2385a6);}};const _0x2c862a=DataManager['isDatabaseLoaded'];DataManager['isDatabaseLoaded']=function(){if(!_0x2c862a['call'](this))return![];for(let _0x5babba in _0xbe1800){if(!_0xbe1800[_0x5babba])QJ['LL']['error'](QJ['LL']['globalText'][0x1]+_0x5babba);if(_0xbe1800[_0x5babba]['copyTexture'])continue;if(_0xbe1800[_0x5babba]['isReady']())QJ['LL']['addTexture'](_0x5babba,_0xbe1800[_0x5babba]);else return![];}QJ['LL']['addMaskTexture']('#000000',_0x1661f3,_0x512cb6);for(let _0x486011 in _0x1101cc){if(_0x1101cc[_0x486011]['copyTexture'])continue;if(_0x1101cc[_0x486011]['isReady']())QJ['LL']['addShadowTexture'](_0x486011,_0x1101cc[_0x486011]);else return![];}return!![];};const _0x32c4c5=Graphics['_createRenderer'];Graphics['_createRenderer']=function(){_0x32c4c5['call'](this);Graphics['lssQJLL']=QJ['LL']['generateMultiTextureShader']();};QJ['LL']['generateMultiTextureShader']=function(){let _0x452c13='\x0a\x20\x20\x20\x20\x20\x20\x20\x20precision\x20highp\x20float;\x0a\x20\x20\x20\x20\x20\x20\x20\x20attribute\x20vec2\x20aVertexPosition;\x0a\x20\x20\x20\x20\x20\x20\x20\x20attribute\x20vec2\x20aTextureCoord;\x0a\x20\x20\x20\x20\x20\x20\x20\x20attribute\x20vec4\x20aColor;\x0a\x20\x20\x20\x20\x20\x20\x20\x20attribute\x20float\x20aTextureId;\x0a\x20\x20\x20\x20\x20\x20\x20\x20uniform\x20mat3\x20projectionMatrix;\x0a\x20\x20\x20\x20\x20\x20\x20\x20varying\x20vec2\x20vTextureCoord;\x0a\x20\x20\x20\x20\x20\x20\x20\x20varying\x20vec4\x20vColor;\x0a\x20\x20\x20\x20\x20\x20\x20\x20varying\x20float\x20vTextureId;\x0a\x20\x20\x20\x20\x20\x20\x20\x20void\x20main(void){\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20gl_Position\x20=\x20vec4((projectionMatrix\x20*\x20vec3(aVertexPosition,\x201.0)).xy,\x200.0,\x201.0);\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20vTextureCoord\x20=\x20aTextureCoord;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20vTextureId\x20=\x20aTextureId;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20vColor\x20=\x20aColor;\x0a\x20\x20\x20\x20\x20\x20\x20\x20}\x0a\x20\x20\x20\x20';let _0x171b0a='\x0a\x20\x20\x20\x20\x20\x20\x20\x20varying\x20vec2\x20vTextureCoord;\x0a\x20\x20\x20\x20\x20\x20\x20\x20varying\x20vec4\x20vColor;\x0a\x20\x20\x20\x20\x20\x20\x20\x20varying\x20float\x20vTextureId;\x0a\x20\x20\x20\x20\x20\x20\x20\x20uniform\x20sampler2D\x20uSamplers[2];\x0a\x20\x20\x20\x20\x20\x20\x20\x20uniform\x20float\x20sRSin;\x0a\x20\x20\x20\x20\x20\x20\x20\x20uniform\x20float\x20sRCos;\x0a\x20\x20\x20\x20\x20\x20\x20\x20uniform\x20float\x20sROffsetX;\x0a\x20\x20\x20\x20\x20\x20\x20\x20uniform\x20float\x20sROffsetY;\x0a\x20\x20\x20\x20\x20\x20\x20\x20uniform\x20float\x20sRScaleX;\x0a\x20\x20\x20\x20\x20\x20\x20\x20uniform\x20float\x20sRScaleY;\x0a\x20\x20\x20\x20\x20\x20\x20\x20uniform\x20float\x20sRScaleX2;\x0a\x20\x20\x20\x20\x20\x20\x20\x20uniform\x20float\x20sRScaleY2;\x0a\x20\x20\x20\x20\x20\x20\x20\x20uniform\x20float\x20frameX;\x0a\x20\x20\x20\x20\x20\x20\x20\x20uniform\x20float\x20frameY;\x0a\x20\x20\x20\x20\x20\x20\x20\x20uniform\x20float\x20frameW;\x0a\x20\x20\x20\x20\x20\x20\x20\x20uniform\x20float\x20frameH;\x0a\x20\x20\x20\x20\x20\x20\x20\x20uniform\x20float\x20startX;\x0a\x20\x20\x20\x20\x20\x20\x20\x20uniform\x20float\x20startY;\x0a\x20\x20\x20\x20\x20\x20\x20\x20void\x20main(void){\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20if\x20(vTextureCoord.x<startX||vTextureCoord.y<startY||vTextureCoord.x>1.0-startX||vTextureCoord.y>1.0-startY)\x20{\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20gl_FragColor\x20=\x20vec4(0,0,0,0);\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20}\x20else\x20{\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20vec4\x20color0\x20=\x20texture2D(uSamplers[0],vec2(\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20(vTextureCoord.x-startX)/(1.0-2.0*startX)/frameW+frameX,\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20(vTextureCoord.y-startY)/(1.0-2.0*startY)/frameH+frameY));\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20vec4\x20color1\x20=\x20texture2D(uSamplers[1],vec2(\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20(vTextureCoord.x*sRCos*sRScaleX-vTextureCoord.y*sRSin*sRScaleY)*sRScaleX2+sROffsetX,\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20(vTextureCoord.y*sRCos*sRScaleY+vTextureCoord.x*sRSin*sRScaleX)*sRScaleY2+sROffsetY));\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20gl_FragColor\x20=\x20color0\x20*\x20color1\x20*\x20vColor;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20}\x0a\x20\x20\x20\x20\x20\x20\x20\x20}\x0a\x20\x20\x20\x20';let _0x453089=new PIXI['Shader'](Graphics['_renderer']['gl'],_0x452c13,_0x171b0a);let _0x3d4017=[];for(let _0x295a86=0x0;_0x295a86<0x2;_0x295a86++){_0x3d4017[_0x295a86]=_0x295a86;}_0x453089['bind']();_0x453089['uniforms']['uSamplers']=_0x3d4017;return _0x453089;};QJ['LL']['addShadowTexture']=function(_0x4ccc23,_0x2dbc0e){let _0x4c7391=document['createElement']('canvas');let _0x4b8bad=_0x4c7391['getContext']('2d');let _0x405eb9=null;let _0x443dac=_0x2dbc0e['width'],_0xd182bb=_0x2dbc0e['height'];_0x4c7391['width']=_0x443dac;_0x4c7391['height']=_0xd182bb;_0x405eb9=new PIXI['BaseTexture'](_0x4c7391);_0x405eb9['scaleMode']=PIXI['SCALE_MODES']['LINEAR'];_0x405eb9['width']=_0x443dac;_0x405eb9['height']=_0xd182bb;_0x4b8bad['globalCompositeOperation']='source-over';_0x4b8bad['drawImage'](_0x2dbc0e['_canvas'],0x0,0x0,_0x443dac,_0xd182bb,0x0,0x0,_0x443dac,_0xd182bb);_0x405eb9['update']();_0x405eb9['copyTexture']=!![];_0x1101cc[_0x4ccc23]=_0x405eb9;};QJ['LL']['addTexture']=function(_0x5d973f,_0x4aa2ae){let _0x478c00=document['createElement']('canvas');let _0x5b5ce5=_0x478c00['getContext']('2d');let _0x1c83b7=null;let _0x2f244c=_0x4aa2ae['width'],_0x1614e7=_0x4aa2ae['height'];_0x478c00['width']=_0x2f244c;_0x478c00['height']=_0x1614e7;_0x1c83b7=new PIXI['BaseTexture'](_0x478c00);_0x1c83b7['scaleMode']=PIXI['SCALE_MODES']['LINEAR'];_0x1c83b7['width']=_0x2f244c;_0x1c83b7['height']=_0x1614e7;_0x5b5ce5['globalCompositeOperation']='source-over';_0x5b5ce5['drawImage'](_0x4aa2ae['_canvas'],0x0,0x0,_0x2f244c,_0x1614e7,0x0,0x0,_0x2f244c,_0x1614e7);_0x1c83b7['update']();_0x1c83b7['copyTexture']=!![];_0xbe1800[_0x5d973f]=_0x1c83b7;};QJ['LL']['addMaskTexture']=function(_0x273a8e,_0x50b428,_0x23b340){let _0x358fe1=document['createElement']('canvas');let _0x104545=_0x358fe1['getContext']('2d');let _0x57c9ca=null;_0x358fe1['width']=_0x50b428;_0x358fe1['height']=_0x23b340;_0x57c9ca=new PIXI['BaseTexture'](_0x358fe1);_0x57c9ca['scaleMode']=PIXI['SCALE_MODES']['LINEAR'];_0x57c9ca['width']=_0x50b428;_0x57c9ca['height']=_0x23b340;_0x104545['fillStyle']=_0x273a8e;_0x104545['fillRect'](0x0,0x0,_0x50b428,_0x23b340);_0x57c9ca['update']();_0x57c9ca['copyTexture']=!![];_0xbe1800['___']=_0x57c9ca;};QJ['LL']['findSprite']=function(_0xaaeb75){if(!SceneManager['_scene'])return null;if(!SceneManager['_scene']['_spriteset'])return null;for(let _0x207a6c of SceneManager['_scene']['_spriteset']['_characterSprites']){if(_0x207a6c['_character']==_0xaaeb75)return _0x207a6c;}return null;};QJ['LL']['getCharacter']=function(_0x4f95c1){if(_0x4f95c1==-0x1)return $gamePlayer;else return $gameMap['event'](_0x4f95c1);};QJ['LL']['calculateAnnotation']=function(_0x27500f){let _0x490af5=null,_0x4c7fc2='';try{_0x490af5=_0x27500f['page']();}catch(_0x5e1127){_0x490af5=null;}if(_0x490af5){if(_0x490af5['list'][0x0]['code']===0x6c){let _0x53d565=0x0;while(_0x490af5['list'][_0x53d565]['code']===0x198||_0x490af5['list'][_0x53d565]['code']===0x6c){_0x4c7fc2=_0x4c7fc2+_0x490af5['list'][_0x53d565]['parameters'][0x0];_0x53d565++;}}}return _0x4c7fc2;};QJ['LL']['getLLData']=function(_0x2588f6,_0x5dc908){if(_0x5dc908['length']<=0x0)return'';let _0x315e18=_0x5dc908['match'](/<QJLL:[^>]*>/i);return _0x315e18?_0x315e18[0x0]['substr'](0x6,_0x315e18[0x0]['length']-0x7):'';};QJ['LL']['getLLDataDetail']=function(_0x4750f0,_0xf8fa6b){for(let _0x5eb9e5=0x0,_0x3c24fc=_0xf8fa6b['match'](/<QJLL-[^:]*:[^>]*>/ig)||[],_0x18a5c1=_0x3c24fc['length'],_0x3020ac;_0x5eb9e5<_0x18a5c1;_0x5eb9e5++){_0x3020ac=_0x3c24fc[_0x5eb9e5]['match'](/<QJLL-([^:]*):([^>]*)>/i);_0x4750f0[_0x3020ac[0x1]]=_0x3020ac[0x2];if(_0x3020ac[0x1]=='dirOffsetX')QJ['LL']['calculateDirAttribute'](_0x4750f0,'dirOffsetX');else if(_0x3020ac[0x1]=='dirOffsetY')QJ['LL']['calculateDirAttribute'](_0x4750f0,'dirOffsetY');else if(_0x3020ac[0x1]=='dirRotation')QJ['LL']['calculateDirAttribute'](_0x4750f0,'dirRotation',!![]);else if(_0x3020ac[0x1]=='dirRotationFrame')_0x4750f0['dirRotationFrame']=Number(_0x4750f0['dirRotationFrame']);else if(_0x3020ac[0x1]=='rotationAuto')_0x4750f0['rotationAuto']=Number(_0x4750f0['rotationAuto'])*Math['PI']/0xb4;else if(_0x3020ac[0x1]=='shadowCharacter')_0x4750f0['shadowCharacter']=eval(_0x4750f0['shadowCharacter']);else if(_0x3020ac[0x1]=='shadowWall')_0x4750f0['shadowWall']=eval(_0x4750f0['shadowWall']);else if(_0x3020ac[0x1]=='shadowCharacterMaxOpacity')_0x4750f0['shadowCharacterMaxOpacity']=Number(_0x4750f0['shadowCharacterMaxOpacity']);else if(_0x3020ac[0x1]=='shadowCharacterMaxDistance')_0x4750f0['shadowCharacterMaxDistance']=Number(_0x4750f0['shadowCharacterMaxDistance']);}};QJ['LL']['getCSData']=function(_0x554749,_0x5e36a3){let _0x3aa182=JsonEx['makeDeepCopy'](_0x592c6b);_0x3aa182['imgName']='';for(let _0x7e310a=0x0,_0x4972c2=_0x5e36a3['match'](/<QJCS-[^:]*:[^>]*>/ig)||[],_0xe7e5b6=_0x4972c2['length'],_0xc9151f;_0x7e310a<_0xe7e5b6;_0x7e310a++){_0xc9151f=_0x4972c2[_0x7e310a]['match'](/<QJCS-([^:]*):([^>]*)>/i);_0x3aa182[_0xc9151f[0x1]]=_0xc9151f[0x2];}_0x3aa182['model']=QJ['LL']['getCSModel'](_0x3aa182['model']);QJ['LL']['calculateDirAttribute'](_0x3aa182,'offsetDirX');QJ['LL']['calculateDirAttribute'](_0x3aa182,'offsetDirY');_0x3aa182['offsetX']=Number(_0x3aa182['offsetX']);_0x3aa182['offsetY']=Number(_0x3aa182['offsetY']);_0x3aa182['opacity']=Number(_0x3aa182['opacity']);_0x3aa182['status']=eval(_0x3aa182['status']);_0x3aa182['tint']=Number('0x'+_0x3aa182['tint']['substr'](0x1));_0x3aa182['yCut']=Number(_0x3aa182['yCut']);return _0x3aa182;};QJ['LL']['preset']=function(_0x6cf3b0,_0x412001){if(!_0x1f1d34[_0x6cf3b0]){QJ['LL']['error'](QJ['LL']['globalText'][0x3]+_0x6cf3b0);}let _0x3eba83=JsonEx['makeDeepCopy'](_0x1f1d34[_0x6cf3b0]);if(_0x412001)QJ['LL']['getLLDataDetail'](_0x3eba83,_0x412001['annotation']);_0x3eba83['scaleX']=new QJFrameLight('scaleX',_0x3eba83['scaleX'],0x0);_0x3eba83['scaleY']=new QJFrameLight('scaleY',_0x3eba83['scaleY'],0x0);_0x3eba83['tint']=new QJFrameLight('tint',_0x3eba83['tint'],0x1);_0x3eba83['offsetX']=new QJFrameLight('offsetX',_0x3eba83['offsetX'],0x0);_0x3eba83['offsetY']=new QJFrameLight('offsetY',_0x3eba83['offsetY'],0x0);_0x3eba83['opacity']=new QJFrameLight('opacity',_0x3eba83['opacity'],0x0);_0x3eba83['shadowCharacterOffsetX']=new QJFrameLight('shadowCharacterOffsetX',_0x3eba83['shadowCharacterOffsetX'],0x0);_0x3eba83['shadowCharacterOffsetY']=new QJFrameLight('shadowCharacterOffsetY',_0x3eba83['shadowCharacterOffsetY'],0x0);_0x3eba83['rotation']=new QJFrameLight('rotation',_0x3eba83['rotation'],0x2);_0x3eba83['shadowCharacterShakeX']=new QJFrameLight('shadowCharacterShakeX',_0x3eba83['shadowCharacterShakeX'],0x0);return _0x3eba83;};QJ['LL']['hexToRgb']=function(_0x1e0179){let _0x2746fe=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i['exec'](_0x1e0179);return{'r':parseInt(_0x2746fe[0x1],0x10),'g':parseInt(_0x2746fe[0x2],0x10),'b':parseInt(_0x2746fe[0x3],0x10)};};QJ['LL']['rgbToHex']=function(_0x5c2542){let _0x1c3723=_0x5c2542['r']['toString'](0x10),_0x2d3f70=_0x5c2542['g']['toString'](0x10),_0x555dae=_0x5c2542['b']['toString'](0x10);return'#'+(_0x1c3723['length']==0x1?'0'+_0x1c3723:_0x1c3723)+(_0x2d3f70['length']==0x1?'0'+_0x2d3f70:_0x2d3f70)+(_0x555dae['length']==0x1?'0'+_0x555dae:_0x555dae);};QJ['LL']['dealRegionLights']=function(_0xcfbea5){if(!_0x19edd3[_0xcfbea5]){QJ['LL']['error'](QJ['LL']['globalText'][0x4]+_0xcfbea5);}let _0x5444c8=JsonEx['makeDeepCopy'](_0x19edd3[_0xcfbea5]);_0x5444c8['scaleX']=new QJFrameLight('scaleX',_0x5444c8['scaleX'],0x0);_0x5444c8['scaleY']=new QJFrameLight('scaleY',_0x5444c8['scaleY'],0x0);_0x5444c8['tint']=new QJFrameLight('tint',_0x5444c8['tint'],0x1);_0x5444c8['offsetX']=new QJFrameLight('offsetX',_0x5444c8['offsetX'],0x0);_0x5444c8['offsetY']=new QJFrameLight('offsetY',_0x5444c8['offsetY'],0x0);_0x5444c8['opacity']=new QJFrameLight('opacity',_0x5444c8['opacity'],0x0);_0x5444c8['rotation']=new QJFrameLight('rotation',_0x5444c8['rotation'],0x2);return _0x5444c8;};QJ['LL']['dealMiniLights']=function(_0x3be9ec){if(!_0xa6dd03[_0x3be9ec]){QJ['LL']['error'](QJ['LL']['globalText'][0x6]+_0x3be9ec);}let _0x374a82=JsonEx['makeDeepCopy'](_0xa6dd03[_0x3be9ec]);_0x374a82['scaleX']=new QJFrameLight('scaleX',_0x374a82['scaleX'],0x0);_0x374a82['scaleY']=new QJFrameLight('scaleY',_0x374a82['scaleY'],0x0);_0x374a82['tint']=new QJFrameLight('tint',_0x374a82['tint'],0x1);_0x374a82['offsetX']=new QJFrameLight('offsetX',_0x374a82['offsetX'],0x0);_0x374a82['offsetY']=new QJFrameLight('offsetY',_0x374a82['offsetY'],0x0);_0x374a82['opacity']=new QJFrameLight('opacity',_0x374a82['opacity'],0x0);_0x374a82['rotation']=new QJFrameLight('rotation',_0x374a82['rotation'],0x2);return _0x374a82;};QJ['LL']['open']=function(){$gameSystem['showLights']=!![];};QJ['LL']['close']=function(){$gameSystem['showLights']=![];};QJ['LL']['tint']=function(_0x3b6405,_0x3f3dd6){if(_0x3b6405==0x0){$gameSystem['lightStaticChange']=[0x0,null,_0x3f3dd6];}else{$gameSystem['lightStaticChange']=[_0x3b6405,new QJFrameLight('___','0|'+$gameSystem['lightStaticChange'][0x2]+'~'+_0x3b6405+'/'+_0x3f3dd6,0x1),_0x3f3dd6];}};QJ['LL']['splHide']=function(){if($gameSystem['playerLight'])$gameSystem['playerLight']['visible']=![];};QJ['LL']['splShow']=function(){if($gameSystem['playerLight'])$gameSystem['playerLight']['visible']=!![];};QJ['LL']['spl']=function(_0x3d94ba){if(!_0x3d94ba){$gameSystem['playerLight']=null;delete $gameSystem['eventLights'][-0x1];}else{if($gameSystem['playerLight']){if(SceneManager['_scene'])SceneManager['_scene']['_spriteset']['removeTargetLight'](-0x1);$gameSystem['playerLight']['setDead']();}$gameSystem['playerLight']=new Game_QJLightLayer(-0x1,QJ['LL']['preset'](_0x3d94ba));$gameSystem['eventLights'][-0x1]=$gameSystem['playerLight'];if(SceneManager['_scene'])SceneManager['_scene']['_spriteset']['addQJLight']($gameSystem['playerLight']);}};QJ['LL']['splScaleX']=function(_0x10f8a9){if($gameSystem['playerLight'])$gameSystem['playerLight']['initData']['scaleX']=new QJFrameLight('scaleX',_0x10f8a9,0x0);};QJ['LL']['splScaleY']=function(_0x3b2732){if($gameSystem['playerLight'])$gameSystem['playerLight']['initData']['scaleY']=new QJFrameLight('scaleY',_0x3b2732,0x0);};QJ['LL']['splTint']=function(_0x38ef93){if($gameSystem['playerLight'])$gameSystem['playerLight']['initData']['tint']=new QJFrameLight('tint',_0x38ef93,0x1);};QJ['LL']['splOffsetX']=function(_0x4fa2a7){if($gameSystem['playerLight'])$gameSystem['playerLight']['initData']['offsetX']=new QJFrameLight('offsetX',_0x4fa2a7,0x0);};QJ['LL']['splOffsetY']=function(_0xcf3c8c){if($gameSystem['playerLight'])$gameSystem['playerLight']['initData']['offsetY']=new QJFrameLight('offsetY',_0xcf3c8c,0x0);};QJ['LL']['splDirOffsetX']=function(_0x59e21f){if($gameSystem['playerLight']){$gameSystem['playerLight']['initData']['offsetDirX']=_0x59e21f;QJ['LL']['calculateDirAttribute']($gameSystem['playerLight']['initData'],'offsetDirX');}};QJ['LL']['splDirOffsetY']=function(_0x14a8cc){if($gameSystem['playerLight']){$gameSystem['playerLight']['initData']['offsetDirY']=_0x14a8cc;QJ['LL']['calculateDirAttribute']($gameSystem['playerLight']['initData'],'offsetDirY');}};QJ['LL']['splOpacity']=function(_0x24fdeb){if($gameSystem['playerLight'])$gameSystem['playerLight']['initData']['opacity']=new QJFrameLight('opacity',_0x24fdeb,0x0);};QJ['LL']['splRotation']=function(_0x5b3ab2){if($gameSystem['playerLight'])$gameSystem['playerLight']['initData']['opacity']=new QJFrameLight('opacity',_0x5b3ab2,0x2);};QJ['LL']['splDirRotation']=function(_0x46dc65){if($gameSystem['playerLight']){$gameSystem['playerLight']['initData']['dirRotation']=_0x46dc65;QJ['LL']['calculateDirAttribute']($gameSystem['playerLight']['initData'],'dirRotation',!![]);}};QJ['LL']['spsStatus']=function(_0x54aee2){$gamePlayer['QJSC']['status']=_0x54aee2;if($gameMap){$gameMap['characterShadowList'][-0x1]=_0x54aee2;$gamePlayer['refreshFollowersShadow']();}};QJ['LL']['spsImgName']=function(_0x1aae0e){$gamePlayer['QJSC']['imgName']=_0x1aae0e;$gamePlayer['textureForShadowNeedRefresh']=!![];};QJ['LL']['spsTint']=function(_0xe64524){$gamePlayer['QJSC']['tint']=_0xe64524;};QJ['LL']['spsOpacity']=function(_0xfb2120){$gamePlayer['QJSC']['opacity']=_0xfb2120;};QJ['LL']['spsOffsetX']=function(_0x35a9e5){$gamePlayer['QJSC']['offsetX']=_0x35a9e5;};QJ['LL']['spsOffsetY']=function(_0x57c156){$gamePlayer['QJSC']['offsetY']=_0x57c156;};QJ['LL']['spsOffsetDirX']=function(_0x3599e5){$gamePlayer['QJSC']['offsetDirX']=_0x3599e5;QJ['LL']['calculateDirAttribute']($gamePlayer['QJSC'],'offsetDirX');};QJ['LL']['spsOffsetDirY']=function(_0x3d103d){$gamePlayer['QJSC']['offsetDirY']=_0x3d103d;QJ['LL']['calculateDirAttribute']($gamePlayer['QJSC'],'offsetDirY');};QJ['LL']['spsModel']=function(_0x4a81f6){$gamePlayer['QJSC']['model']=QJ['LL']['getCSModel'](_0x4a81f6);};QJ['LL']['spsYCut']=function(_0xe3874f){$gamePlayer['QJSC']['yCut']=_0xe3874f;};QJ['LL']['tempLight']=function(_0x52bdfd,_0x492d75,_0x590d90,_0x1b5941){let _0x5480a9=QJ['LL']['dealMiniLights'](_0x52bdfd);_0x5480a9['during']=Math['max'](0x0,_0x492d75);let _0x2a4c65=new Game_QJLightLayerMini({'type':0x0,'x':_0x590d90+_0x3f5f67+_0x54ffa6/0x2,'y':_0x1b5941+_0x41dc67+_0x54ffa6/0x2},_0x5480a9,$gameSystem['miniLights']['length']);$gameSystem['miniLights']['push'](_0x2a4c65);if(SceneManager['_scene']){SceneManager['_scene']['_spriteset']['addQJMiniLight'](_0x2a4c65);}};QJ['LL']['tempLightObject']=function(_0x5bf9c1,_0x52e099,_0x377f72){let _0x4caabe=QJ['LL']['dealMiniLights'](_0x5bf9c1),_0x2b9eff={'type':0x2,'object':_0x52e099};_0x4caabe['during']=-0x1;for(let _0x1818dc in _0x377f72)_0x2b9eff[_0x1818dc]=_0x377f72[_0x1818dc];let _0x122ef9=new Game_QJLightLayerMini(_0x2b9eff,_0x4caabe,$gameSystem['miniLights']['length']);$gameSystem['miniLights']['push'](_0x122ef9);if(SceneManager['_scene']){SceneManager['_scene']['_spriteset']['addQJMiniLight'](_0x122ef9);}};const _0x2ee4ce=Scene_Map['prototype']['updateMain'];Scene_Map['prototype']['updateMain']=function(){_0x2ee4ce['call'](this);_0x2ebc77=$gameMap['displayX']();_0x3fd8e5=$gameMap['displayY']();_0x3f5f67=Math['floor'](_0x2ebc77*0x30-_0x54ffa6/0x2);_0x41dc67=Math['floor'](_0x3fd8e5*0x30-_0x54ffa6/0x2);if($gameSystem['showLights']){for(let _0x386a6f in $gameSystem['eventLights']){$gameSystem['eventLights'][_0x386a6f]['update']();}let _0x2a4c6c=$gameSystem['miniLights'];for(let _0x456545 of _0x2a4c6c){if(_0x456545)_0x456545['update']();}}};Game_System['prototype']['showLights']=eval(_0x243bb3['defaultOpen']);Game_System['prototype']['lightStaticChange']=[0x0,null,_0x243bb3['maskInitColor']];Game_System['prototype']['playerLight']=null;Game_System['prototype']['eventLights']={};Game_System['prototype']['miniLights']=[];const _0x21829a=Game_Map['prototype']['setup'];Game_Map['prototype']['setup']=function(_0x4816f3){$gameSystem['eventLights']={};if($gameSystem['playerLight'])$gameSystem['eventLights'][-0x1]=$gameSystem['playerLight'];$gameSystem['miniLights']=[];this['characterShadowList']={};this['characterShadowList'][-0x1]=$gamePlayer['QJSC']['status'];$gamePlayer['refreshFollowersShadow']();_0x21829a['call'](this,_0x4816f3);let _0x54178d=$dataTilesets[this['_tilesetId']]['meta'];this['terrainTagToRegion']=[0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0];for(let _0x21d75d=0x1,_0x239b53;_0x21d75d<0x8;_0x21d75d++){if(_0x54178d['QJTS-'+_0x21d75d]){_0x239b53=Number(_0x54178d['QJTS-'+_0x21d75d]);if(_0x2b8ad5[_0x239b53]){this['terrainTagToRegion'][_0x21d75d]=_0x239b53;}}}this['terrainTagToRegionLights']=[0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0];for(let _0x327fe4=0x1,_0x2c13e8;_0x327fe4<0x8;_0x327fe4++){if(_0x54178d['QJL-'+_0x327fe4]){_0x2c13e8=Number(_0x54178d['QJL-'+_0x327fe4]);if(_0x19edd3[_0x2c13e8]){this['terrainTagToRegionLights'][_0x327fe4]=_0x2c13e8;}}}this['shadowDataQJLL']=new Array(this['width']());for(let _0xb355e1=0x0,_0x3fdcef=this['width'](),_0x363450,_0x4bae2c=this['height'](),_0x240a18,_0x2f77d8,_0x3fa4a3,_0x1dd3ad;_0xb355e1<_0x3fdcef;_0xb355e1++){this['shadowDataQJLL'][_0xb355e1]=new Array(this['height']());for(_0x363450=0x0;_0x363450<_0x4bae2c;_0x363450++){_0x240a18=this['regionIdForLight'](_0xb355e1,_0x363450);if(_0x19edd3[_0x240a18]){$gameSystem['miniLights']['push'](new Game_QJLightLayerMini({'type':0x1,'regionId':_0x240a18,'x':_0xb355e1*0x30+0x18,'y':_0x363450*0x30+0x18,'mapX':_0xb355e1,'mapY':_0x363450},QJ['LL']['dealRegionLights'](_0x240a18),$gameSystem['miniLights']['length']));}_0x240a18=this['regionIdForShadow'](_0xb355e1,_0x363450);if(_0x2b8ad5[_0x240a18]){_0x1dd3ad=_0x2b8ad5[_0x240a18]['shadowHeight'];for(_0x3fa4a3=0x1;_0x3fa4a3<=_0x2b8ad5[_0x240a18]['shadowHeight'];_0x3fa4a3++){_0x2f77d8=this['regionIdForShadow'](_0xb355e1,_0x363450+_0x3fa4a3);if(_0x2b8ad5[_0x2f77d8]){_0x1dd3ad=_0x3fa4a3-0x1;break;}}for(_0x3fa4a3=0x0;_0x3fa4a3<=_0x1dd3ad;_0x3fa4a3++){this['shadowDataQJLL'][_0xb355e1][_0x363450+_0x3fa4a3]=_0x363450+_0x1dd3ad;}_0x363450+=_0x1dd3ad;}else this['shadowDataQJLL'][_0xb355e1][_0x363450]=-0x1;}}if($gamePlayer['playerLight'])$gamePlayer['playerLight']['update']();};Game_Map['prototype']['regionIdForShadow']=function(_0x3be490,_0x358f97){let _0x2a2a86=this['regionId'](_0x3be490,_0x358f97),_0x157bd6;if(!_0x2b8ad5[_0x2a2a86]&&this['terrainTagToRegion']){_0x157bd6=this['terrainTag'](_0x3be490,_0x358f97);if(this['terrainTagToRegion'][_0x157bd6]>0x0){_0x2a2a86=this['terrainTagToRegion'][_0x157bd6];}}return _0x2a2a86;};Game_Map['prototype']['regionIdForLight']=function(_0x100757,_0x24776d){let _0x3ffc4e=this['regionId'](_0x100757,_0x24776d),_0x361f64;if(!_0x19edd3[_0x3ffc4e]&&this['terrainTagToRegionLights']){_0x361f64=this['terrainTag'](_0x100757,_0x24776d);if(this['terrainTagToRegionLights'][_0x361f64]>0x0){_0x3ffc4e=this['terrainTagToRegionLights'][_0x361f64];}}return _0x3ffc4e;};const _0x2f31b8=Game_Player['prototype']['initMembers'];Game_Player['prototype']['initMembers']=function(){_0x2f31b8['call'](this);$gameSystem['playerLight']=!_0x243bb3['playerInitLight']?null:new Game_QJLightLayer(-0x1,QJ['LL']['preset'](_0x243bb3['playerInitLight']));this['QJSC']=JsonEx['makeDeepCopy'](_0x31434d);for(let _0xd1be66 of this['_followers']['_data']){_0xd1be66['QJSC']=this['QJSC'];}this['textureForShadowNeedRefresh']=!![];this['reSetX']=0x0;this['reSetY']=0x0;this['remRegionId']=0x0;};Game_Player['prototype']['refreshFollowersShadow']=function(){for(let _0x51924e=0x0,_0x39129e=this['_followers']['_data']['length'],_0xe13d55=this['_followers']['_visible']&&$gamePlayer['QJSC']['status'];_0x51924e<_0x39129e;_0x51924e++){$gameMap['characterShadowList'][-(_0x51924e+0x2)]=_0xe13d55;}};const _0x5c8970=Game_Player['prototype']['showFollowers'];Game_Player['prototype']['showFollowers']=function(){_0x5c8970['call'](this);this['refreshFollowersShadow']();};const _0x564663=Game_Player['prototype']['hideFollowers'];Game_Player['prototype']['hideFollowers']=function(){_0x564663['call'](this);this['refreshFollowersShadow']();};const _0x32602c=Game_Player['prototype']['update'];Game_Player['prototype']['update']=function(_0x12286c){_0x32602c['call'](this,_0x12286c);this['reSetX']=Math['floor'](this['_realX']+0.5);this['reSetY']=Math['floor'](this['_realY']+0.5);this['remRegionId']=$gameMap['regionId'](this['reSetX'],this['reSetY']);};const _0x83ec8d=Game_Event['prototype']['setupPage'];Game_Event['prototype']['setupPage']=function(){_0x83ec8d['call'](this);if($gameSystem['eventLights'][this['_eventId']]){$gameSystem['eventLights'][this['_eventId']]['setDead']();if(SceneManager['_scene']){SceneManager['_scene']['_spriteset']['removeTargetLight'](this['_eventId']);}}this['annotation']=QJ['LL']['calculateAnnotation'](this);let _0x2223ca=QJ['LL']['getLLData'](this,this['annotation']);if(_0x2223ca){let _0x44708f=new Game_QJLightLayer(this['_eventId'],QJ['LL']['preset'](_0x2223ca,this));$gameSystem['eventLights'][this['_eventId']]=_0x44708f;if(SceneManager['_scene']['_spriteset'])SceneManager['_scene']['_spriteset']['addQJLight'](_0x44708f);}this['QJSC']=QJ['LL']['getCSData'](this,this['annotation']);$gameMap['characterShadowList'][this['_eventId']]=this['QJSC']['status'];this['textureForShadowNeedRefresh']=!![];};let _0x370663={};const _0x140493=Spriteset_Base['prototype']['initialize'];Spriteset_Base['prototype']['initialize']=function(){_0x370663={};_0x140493['call'](this);};const _0xf4340c=Spriteset_Map['prototype']['createUpperLayer'];Spriteset_Map['prototype']['createUpperLayer']=function(){_0xf4340c['call'](this);this['lightSystemSprite']=new _0x43114b(this);this['addChild'](this['lightSystemSprite']);this['lightCharacterShadowContainer']=new _0x20520f(this['lightSystemSprite']);this['_tilemap']['addChildAt'](this['lightCharacterShadowContainer'],0x0);};Spriteset_Map['prototype']['addQJLight']=function(_0xf8b0f8){return this['lightSystemSprite']['addQJLight'](_0xf8b0f8);};Spriteset_Map['prototype']['addQJMiniLight']=function(_0x1b05b9){return this['lightSystemSprite']['addQJMiniLight'](_0x1b05b9);};Spriteset_Map['prototype']['removeTargetLight']=function(_0x369114){return this['lightSystemSprite']['removeTargetLight'](_0x369114);};const _0x5e6f8a=Sprite_Character['prototype']['setCharacter'];Sprite_Character['prototype']['setCharacter']=function(_0x1d7486){_0x5e6f8a['call'](this,_0x1d7486);this['refreshTextureForShadow']();if(_0x1d7486['_eventId'])_0x370663[_0x1d7486['_eventId']]=this;else if(_0x1d7486==$gamePlayer)_0x370663[-0x1]=this;else{for(let _0x3ddbab=$gamePlayer['_followers']['_data'],_0x201e99=0x0,_0x53767f=_0x3ddbab['length'];_0x201e99<_0x53767f;_0x201e99++){if(_0x1d7486==_0x3ddbab[_0x201e99])_0x370663[-(_0x201e99+0x2)]=this;}}};const _0xf5469=Sprite_Character['prototype']['update'];Sprite_Character['prototype']['update']=function(){_0xf5469['call'](this);if(this['_character']['textureForShadowNeedRefresh']){this['refreshTextureForShadow']();}if(this['textureLLSpecial']&&this['textureLLSpecial']['dirMode']){let _0x4dfb5e=this['textureLLSpecial']['frame']['height']*(this['_character']['direction']()/0x2-0x1);if(this['textureLLSpecial']['frame']['y']!=_0x4dfb5e){this['textureLLSpecial']['frame']['y']=_0x4dfb5e;this['textureLLSpecial']['frame']=this['textureLLSpecial']['frame'];}}};Sprite_Character['prototype']['refreshTextureForShadow']=function(){this['_character']['textureForShadowNeedRefresh']=![];let _0x1ba69c=this['_character']['QJSC'];if(!_0x1ba69c)return;if(!_0x1ba69c['imgName']){this['textureLLSpecial']=null;}else{if(!_0x1101cc[_0x1ba69c['imgName']]){QJ['LL']['error'](QJ['LL']['globalText'][0x2]+_0x1ba69c['imgName']+'\x20'+this['_eventId']+'\x20'+$gameMap['mapId']());}else{let _0x958842=_0x1101cc[_0x1ba69c['imgName']];this['textureLLSpecial']=new PIXI['Texture'](_0x958842);if(_0x1ba69c['imgName'][0x0]=='$'){this['textureLLSpecial']['dirMode']=!![];this['textureLLSpecial']['frame']=new PIXI['Rectangle'](0x0,0x0,0x0,0x0);this['textureLLSpecial']['frame']['height']=_0x958842['height']/0x4;this['textureLLSpecial']['frame']['width']=_0x958842['width'];this['textureLLSpecial']['frame']['x']=0x0;this['textureLLSpecial']['frame']['y']=this['textureLLSpecial']['frame']['height']*(this['_character']['direction']()/0x2-0x1);this['textureLLSpecial']['frame']=this['textureLLSpecial']['frame'];}else{this['textureLLSpecial']['dirMode']=![];}}}};const _0x2e6ab8=Sprite_Character['prototype']['setTileBitmap'];Sprite_Character['prototype']['setTileBitmap']=function(){_0x2e6ab8['call'](this);if(this['bitmap'])this['bitmap']['addLoadListener'](_0x35c75a=>this['transfromTextureLL'](_0x35c75a));else this['textureLL']=null;};const _0x5bfd3a=Sprite_Character['prototype']['setCharacterBitmap'];Sprite_Character['prototype']['setCharacterBitmap']=function(){_0x5bfd3a['call'](this);if(this['bitmap'])this['bitmap']['addLoadListener'](_0x216698=>this['transfromTextureLL'](_0x216698));else this['textureLL']=null;};Sprite_Character['prototype']['transfromTextureLL']=function(_0x3551bb){_0x3551bb=_0x3551bb?_0x3551bb:this['bitmap'];if(_0x3551bb&&_0x3551bb['_image']){let _0x2b8fed=_0x3551bb['_image'];let _0x51ac1c=document['createElement']('canvas');let _0x4e1487=_0x2b8fed['width'],_0x1051cd=_0x2b8fed['height'];_0x51ac1c['width']=_0x4e1487;_0x51ac1c['height']=_0x1051cd;let _0x3ac90e=_0x51ac1c['getContext']('2d');_0x3ac90e['drawImage'](_0x2b8fed,0x0,0x0,_0x4e1487,_0x1051cd,0x0,0x0,_0x4e1487,_0x1051cd);this['textureLL']=new PIXI['Texture'](new PIXI['BaseTexture'](_0x51ac1c));}else this['textureLL']=null;};function _0x5f587f(){this['initialize']['apply'](this,arguments);}_0x5f587f['prototype']=Object['create'](PIXI['Container']['prototype']);_0x5f587f['prototype']['constructor']=_0x5f587f;_0x5f587f['prototype']['initialize']=function(){PIXI['Container']['call'](this);};_0x5f587f['prototype']['update']=function(){this['children']['forEach'](function(_0x193ae9){if(_0x193ae9['update']){_0x193ae9['update']();}});};function _0x7e2ea4(){this['initialize']['apply'](this,arguments);}_0x7e2ea4['prototype']=Object['create'](PIXI['Filter']['prototype']);_0x7e2ea4['prototype']['constructor']=_0x7e2ea4;_0x7e2ea4['prototype']['initialize']=function(){let _0x4536fc='\x0a\x20\x20\x20\x20attribute\x20vec2\x20aVertexPosition;\x0a\x20\x20\x20\x20attribute\x20vec2\x20aTextureCoord;\x0a\x20\x20\x20\x20varying\x20vec2\x20vTextureCoord;\x0a\x20\x20\x20\x20uniform\x20mat3\x20projectionMatrix;\x0a\x20\x20\x20\x20void\x20main(void){\x0a\x20\x20\x20\x20\x20\x20\x20\x20gl_Position\x20=\x20vec4((projectionMatrix\x20*\x20vec3(aVertexPosition,\x201.0)).xy,\x200.0,\x201.0);\x0a\x20\x20\x20\x20\x20\x20\x20\x20vTextureCoord\x20=\x20aTextureCoord\x20;\x0a\x20\x20\x20\x20}';let _0x154d69='\x0a\x20\x20\x20\x20varying\x20vec2\x20vTextureCoord;\x0a\x20\x20\x20\x20uniform\x20sampler2D\x20uSampler;\x0a\x20\x20\x20\x20uniform\x20vec4\x20backgroundColor;\x0a\x20\x20\x20\x20void\x20main(void){\x0a\x20\x20\x20\x20\x20\x20\x20vec4\x20sample\x20=\x20texture2D(uSampler,\x20vTextureCoord);\x0a\x20\x20\x20\x20\x20\x20\x20gl_FragColor\x20=\x20sample\x20+\x20backgroundColor;\x0a\x20\x20\x20\x20}';PIXI['Filter']['call'](this,_0x4536fc,_0x154d69);};_0x7e2ea4['prototype']['setBackgroundColor']=function(_0x608ca9,_0xcf2943,_0x3b990f,_0x3db71d){this['uniforms']['backgroundColor'][0x0]=_0x608ca9*_0x3db71d;this['uniforms']['backgroundColor'][0x1]=_0xcf2943*_0x3db71d;this['uniforms']['backgroundColor'][0x2]=_0x3b990f*_0x3db71d;this['uniforms']['backgroundColor'][0x3]=_0x3db71d;};function _0x43114b(){this['initialize']['apply'](this,arguments);}_0x43114b['prototype']=Object['create'](PIXI['Sprite']['prototype']);_0x43114b['prototype']['constructor']=_0x43114b;_0x43114b['prototype']['initialize']=function(_0x72b625){this['spriteset']=_0x72b625;this['mw']=$gameMap['width']()*0x30+_0x54ffa6;this['mh']=$gameMap['height']()*0x30+_0x54ffa6;this['oldFilterColor']=null;this['whiteVisible']=![];PIXI['Sprite']['call'](this);this['x']=-_0x54ffa6/0x2;this['y']=-_0x54ffa6/0x2;this['filterMask']=new _0x7e2ea4();this['filterMask']['blendMode']=0x2;this['filters']=[this['filterMask']];this['filterArea']=new Rectangle(0x0,0x0,_0x1661f3,_0x512cb6);this['updateFilterColor']();this['miniLightsContainer']=new PIXI['Container']();this['addChild'](this['miniLightsContainer']);let _0x46c912,_0xf9d3e1,_0x5aaf1d=null;_0x46c912=document['createElement']('canvas');_0xf9d3e1=_0x46c912['getContext']('2d');_0x46c912['width']=this['mw'];_0x46c912['height']=this['mh'];_0x5aaf1d=new PIXI['BaseTexture'](_0x46c912);_0x5aaf1d['scaleMode']=PIXI['SCALE_MODES']['LINEAR'];_0x5aaf1d['width']=this['mw'];_0x5aaf1d['height']=this['mh'];this['blockContext']=_0xf9d3e1;this['blocklsBaseTexture']=_0x5aaf1d;this['blockTexture']=new PIXI['Texture'](_0x5aaf1d);this['blockSprite']=new PIXI['Sprite'](this['blockTexture']);this['blockSprite']['blendMode']=0x2;this['setBlock'](this['blockContext'],this['blocklsBaseTexture']);this['updateBlocklsTextureFrame']();this['addChild'](this['blockSprite']);for(let _0x463cad in $gameSystem['eventLights']){this['addQJLight']($gameSystem['eventLights'][_0x463cad]);}for(let _0x2a4e9d of $gameSystem['miniLights']){if(_0x2a4e9d)this['addQJMiniLight'](_0x2a4e9d);}};_0x43114b['prototype']['updateBlocklsTextureFrame']=function(){let _0x23ef01=(_0x3f5f67+0x0)['clamp'](0x0,this['mw']),_0x5ad5d8=(_0x41dc67+0x0)['clamp'](0x0,this['mh']);let _0x3ceb30=(_0x1661f3-_0x23ef01+_0x3f5f67)['clamp'](0x0,this['mw']-_0x23ef01);let _0x237331=(_0x512cb6-_0x5ad5d8+_0x41dc67)['clamp'](0x0,this['mh']-_0x5ad5d8);this['blockTexture']['frame']['x']=_0x23ef01;this['blockTexture']['frame']['y']=_0x5ad5d8;this['blockTexture']['frame']['width']=_0x3ceb30;this['blockTexture']['frame']['height']=_0x237331;this['blockSprite']['pivot']['x']=_0x3f5f67-_0x23ef01;this['blockSprite']['pivot']['y']=_0x41dc67-_0x5ad5d8;this['blockTexture']['frame']=this['blockTexture']['frame'];};_0x43114b['prototype']['addQJLight']=function(_0x32c38c){let _0x11e041=new _0x58384f(this,_0x32c38c);this['addChildAt'](_0x11e041,0x0);return _0x11e041;};_0x43114b['prototype']['addQJMiniLight']=function(_0x5f10d5){let _0x2dba1d=new _0x37a865(this,_0x5f10d5);this['miniLightsContainer']['addChild'](_0x2dba1d);return _0x2dba1d;};_0x43114b['prototype']['removeTargetLight']=function(_0x1e9b59){for(let _0x53fef6 of this['children']){if(_0x53fef6['character']==_0x1e9b59){_0x53fef6['setDead']();break;}}};_0x43114b['prototype']['refreshFilter']=function(_0x289717){let _0x29927f=parseInt(_0x289717['substr'](0x1,0x2),0x10)/0xff;let _0x3fa9eb=parseInt(_0x289717['substr'](0x3,0x2),0x10)/0xff;let _0x4facdd=parseInt(_0x289717['substr'](0x5,0x2),0x10)/0xff;this['oldFilterColor']=_0x289717;if(!this['whiteVisible']){if(this['oldFilterColor']!='#ffffff'){this['whiteVisible']=!![];}}else{if(this['oldFilterColor']=='#ffffff'){this['whiteVisible']=![];}}this['filterMask']['setBackgroundColor'](_0x29927f,_0x3fa9eb,_0x4facdd,0x1);};_0x43114b['prototype']['updateFilterColor']=function(){if($gameSystem['lightStaticChange'][0x0]>0x0){if(!$gameSystem['lightStaticChange'][0x1]){$gameSystem['lightStaticChange'][0x0]=0x0;$gameSystem['lightStaticChange'][0x1]=null;if(this['oldFilterColor']!=$gameSystem['lightStaticChange'][0x2]){this['refreshFilter']($gameSystem['lightStaticChange'][0x2]);}}else{$gameSystem['lightStaticChange'][0x0]--;let _0x480ff7=$gameSystem['lightStaticChange'][0x1]['get']();if(this['oldFilterColor']!=_0x480ff7){this['refreshFilter'](_0x480ff7);}if($gameSystem['lightStaticChange'][0x0]==0x0)$gameSystem['lightStaticChange'][0x1]=null;}}else{if(this['oldFilterColor']!=$gameSystem['lightStaticChange'][0x2]){this['refreshFilter']($gameSystem['lightStaticChange'][0x2]);}}};_0x43114b['prototype']['update']=function(){this['updateFilterColor']();this['visible']=$gameSystem['showLights']&&this['whiteVisible'];if(this['visible']){this['children']['forEach'](_0x213d42=>{if(_0x213d42['update'])_0x213d42['update']();});this['miniLightsContainer']['children']['forEach'](_0x217f92=>{if(_0x217f92['update'])_0x217f92['update']();});this['updateBlocklsTextureFrame']();}};_0x43114b['prototype']['setBlock']=function(_0x389593,_0x235652){let _0x22f0e8,_0x3b9d1c,_0x40a7ab,_0x238e76,_0x417829,_0x33f05d;for(let _0x4928e5=0x0,_0x58ea69=$gameMap['width']();_0x4928e5<_0x58ea69;_0x4928e5++){for(let _0x576aed=0x0,_0x57e51d=$gameMap['height']();_0x576aed<_0x57e51d;_0x576aed++){_0x22f0e8=$gameMap['regionIdForShadow'](_0x4928e5,_0x576aed);if(_0x2b8ad5[_0x22f0e8]&&_0x2b8ad5[_0x22f0e8]['rectShape']['length']>0x0){_0x238e76=_0x4928e5*0x30;_0x417829=_0x576aed*0x30;_0x3b9d1c=_0x2b8ad5[_0x22f0e8]['rectShape'];_0x389593['save']();_0x389593['fillStyle']=_0x2b8ad5[_0x22f0e8]['rectTint'];_0x389593['globalAlpha']=_0x2b8ad5[_0x22f0e8]['rectOpacity'];_0x389593['translate'](_0x238e76,_0x417829);for(let _0x41b7c1=0x0,_0x2f5e6b=0x0,_0x192b74=_0x3b9d1c['length'],_0xe39aea=_0x3b9d1c[0x0]['x'],_0x11b02f=_0x3b9d1c[0x0]['y'],_0x5b02fa,_0x3a0511;_0x41b7c1<_0x192b74;_0x41b7c1++){if(_0x2f5e6b==0x0){_0x389593['beginPath']();_0x389593['moveTo'](_0xe39aea,_0x11b02f);}_0x40a7ab=_0x3b9d1c[_0x41b7c1]['t'];_0x2f5e6b++;_0x5b02fa=_0x3b9d1c[_0x41b7c1+0x1]?_0x3b9d1c[_0x41b7c1+0x1]['x']:_0xe39aea;_0x3a0511=_0x3b9d1c[_0x41b7c1+0x1]?_0x3b9d1c[_0x41b7c1+0x1]['y']:_0x11b02f;if(_0x40a7ab==0x0){_0x389593['lineTo'](_0x5b02fa,_0x3a0511);}else if(_0x40a7ab==0x5){_0x389593['closePath']();_0x389593['fill']();if(!_0x3b9d1c[_0x41b7c1+0x1])break;_0xe39aea=_0x3b9d1c[_0x41b7c1+0x1]['x'];_0x11b02f=_0x3b9d1c[_0x41b7c1+0x1]['y'];_0x2f5e6b=0x0;continue;}else{_0x389593['arc'](_0x3b9d1c[_0x41b7c1]['cx'],_0x3b9d1c[_0x41b7c1]['cy'],_0x3b9d1c[_0x41b7c1]['r'],_0x3b9d1c[_0x41b7c1]['sa'],_0x3b9d1c[_0x41b7c1]['ea'],_0x3b9d1c[_0x41b7c1]['ccw']);}if(_0x41b7c1==_0x192b74-0x1){_0x389593['closePath']();_0x389593['fill']();}}_0x389593['restore']();}}}_0x235652['update']();};Game_QJLightLayer['prototype']['initialize']=function(_0x3d2339,_0x3b0846){this['character']=_0x3d2339;this['dead']=![];this['shadowWall']=_0x3b0846['shadowWall'];this['shadowCharacter']=_0x3b0846['shadowCharacter'];this['visible']=!![];this['x']=0x0;this['y']=0x0;this['scaleX']=0x1;this['scaleY']=0x1;this['opacity']=0x1;this['rotation']=0x0;this['rotationAuto']=0x0;this['tint']='#FFFFFF';this['initData']=_0x3b0846;this['dirRotationFrame']=[0x0,0x0,0x0,0x0];this['shadowCharacterShakeX']=0x1;this['dialogLength']=0x0;this['needRefreshFrame']=![];this['lightSpriteFrame']=[0x0,0x0,0x1,0x1];let _0x5af533=_0xbe1800[_0x3b0846['imgName']];this['bimtapWidth']=_0x5af533['width'];this['bimtapHeight']=_0x5af533['height'];if(_0x3b0846['imgName']['includes']('$')){this['lightSpriteFrame'][0x3]=0x4;this['dirImgFrame']=!![];}else this['lightSpriteFrame'][0x3]=0x1;let _0x7c3626=_0x3b0846['imgName']['match'](/\[([^,]+)\,([^]+)\]/i);if(_0x7c3626){this['dramaticBitmap']=[0x0,Number(_0x7c3626[0x2]),0x0,Number(_0x7c3626[0x1])];this['lightSpriteFrame'][0x2]=this['dramaticBitmap'][0x3];}else this['lightSpriteFrame'][0x2]=0x1;this['dialogLength']=Math['floor'](Math['sqrt'](this['bimtapWidth']*this['bimtapWidth']/this['lightSpriteFrame'][0x2]/this['lightSpriteFrame'][0x2]+this['bimtapHeight']*this['bimtapHeight']/this['lightSpriteFrame'][0x3]/this['lightSpriteFrame'][0x3]));this['startX']=(0x1-this['bimtapWidth']/this['lightSpriteFrame'][0x2]/this['dialogLength'])/0x2;this['startY']=(0x1-this['bimtapHeight']/this['lightSpriteFrame'][0x3]/this['dialogLength'])/0x2;this['update']();};Game_QJLightLayer['prototype']['updateFrame']=function(_0x17690c){if(!this['dirImgFrame']&&!this['dramaticBitmap'])return;let _0x4cb726=0x0,_0x3e4b7e=0x0;if(this['dirImgFrame'])_0x3e4b7e=(_0x17690c['direction']()/0x2-0x1)/0x4;else _0x3e4b7e=0x0;if(this['dramaticBitmap']){this['dramaticBitmap'][0x0]++;if(this['dramaticBitmap'][0x0]>=this['dramaticBitmap'][0x1]){this['dramaticBitmap'][0x0]=0x0;this['dramaticBitmap'][0x2]++;if(this['dramaticBitmap'][0x2]>=this['dramaticBitmap'][0x3]){this['dramaticBitmap'][0x2]=0x0;}}_0x4cb726=this['dramaticBitmap'][0x2]/this['dramaticBitmap'][0x3];}else _0x4cb726=0x0;if(_0x4cb726!=this['lightSpriteFrame'][0x0]||_0x3e4b7e!=this['lightSpriteFrame'][0x1]){this['needRefreshFrame']=!![];this['lightSpriteFrame'][0x0]=_0x4cb726;this['lightSpriteFrame'][0x1]=_0x3e4b7e;}};Game_QJLightLayer['prototype']['update']=function(){let _0x2c080c=QJ['LL']['getCharacter'](this['character']);if(!_0x2c080c){this['setDead']();return;}let _0x43eb68=this['initData'];this['updateFrame'](_0x2c080c);this['rotationAuto']+=_0x43eb68['rotationAuto'];let _0x36c43c=_0x2c080c['direction']();this['x']=_0x2c080c['_realX']*_0x34cb7d+_0x43eb68['offsetX']['get']()+_0x43eb68['dirOffsetX'][_0x36c43c];this['y']=_0x2c080c['_realY']*_0x34cb7d+_0x43eb68['offsetY']['get']()+_0x43eb68['dirOffsetY'][_0x36c43c];this['scaleX']=_0x43eb68['scaleX']['get']();this['scaleY']=_0x43eb68['scaleY']['get']();this['opacity']=_0x43eb68['opacity']['get']();this['rotation']=_0x43eb68['rotation']['get']()+this['rotationAuto'];this['shadowCharacterOffsetX']=_0x43eb68['shadowCharacterOffsetX']['get']();this['shadowCharacterOffsetY']=_0x43eb68['shadowCharacterOffsetY']['get']();if(this['dirRotationFrame'][0x3]!=_0x43eb68['dirRotation'][_0x36c43c]){if(_0x43eb68['dirRotationFrame']>0x0){this['dirRotationFrame'][0x0]=_0x43eb68['dirRotationFrame'];let _0x53342f=_0x43eb68['dirRotation'][_0x36c43c]-this['dirRotationFrame'][0x3];if(Math['abs'](_0x53342f)>Math['PI']){this['dirRotationFrame'][0x1]=-Math['sign'](_0x53342f)*(Math['abs'](_0x53342f)-Math['PI'])/_0x43eb68['dirRotationFrame'];}else{this['dirRotationFrame'][0x1]=_0x53342f/_0x43eb68['dirRotationFrame'];}this['dirRotationFrame'][0x2]=this['dirRotationFrame'][0x3];this['dirRotationFrame'][0x3]=_0x43eb68['dirRotation'][_0x36c43c];}else{this['dirRotationFrame'][0x0]=0x0;this['dirRotationFrame'][0x3]=_0x43eb68['dirRotation'][_0x36c43c];}}if(this['dirRotationFrame'][0x0]==0x0){this['rotation']+=this['dirRotationFrame'][0x3];}else{this['dirRotationFrame'][0x2]+=this['dirRotationFrame'][0x1];this['dirRotationFrame'][0x0]--;this['rotation']+=this['dirRotationFrame'][0x2];}this['tint']=_0x43eb68['tint']['get']();this['shadowCharacterShakeX']=_0x43eb68['shadowCharacterShakeX']['get']();};Game_QJLightLayer['prototype']['setDead']=function(){if(this['character']==-0x1){$gameSystem['playerLight']=null;}delete $gameSystem['eventLights'][this['character']];this['dead']=!![];};Game_QJLightLayerMini['prototype']['initialize']=function(_0x4a98fa,_0x1c094c,_0xb01a14){this['dead']=![];this['visible']=!![];this['index']=_0xb01a14;this['attach']=_0x4a98fa;this['existTime']=0x0;this['x']=0x0;this['y']=0x0;this['scaleX']=0x1;this['scaleY']=0x1;this['opacity']=0x1;this['rotation']=0x0;this['rotationAuto']=0x0;this['tint']='#FFFFFF';this['initData']=_0x1c094c;this['time']=this['initData']['during'];this['needRefreshFrame']=!![];let _0x1794e5=_0xbe1800[_0x1c094c['imgName']];this['lightSpriteFrame']=[0x0,0x0,_0x1794e5['width'],_0x1794e5['height']];let _0x202a85=_0x1c094c['imgName']['match'](/\[([^,]+)\,([^]+)\]/i);if(_0x202a85){this['dramaticBitmap']=[0x0,Number(_0x202a85[0x2]),0x0,Number(_0x202a85[0x1])];this['lightSpriteFrame'][0x2]/=this['dramaticBitmap'][0x3];}this['update']();};Game_QJLightLayerMini['prototype']['updateFrame']=function(){if(!this['dramaticBitmap'])return;let _0x1bd129=0x0;if(this['dramaticBitmap']){this['dramaticBitmap'][0x0]++;if(this['dramaticBitmap'][0x0]>=this['dramaticBitmap'][0x1]){this['dramaticBitmap'][0x0]=0x0;this['dramaticBitmap'][0x2]++;if(this['dramaticBitmap'][0x2]>=this['dramaticBitmap'][0x3]){this['dramaticBitmap'][0x2]=0x0;}}_0x1bd129=this['dramaticBitmap'][0x2]*this['lightSpriteFrame'][0x2];}if(_0x1bd129!=this['lightSpriteFrame'][0x0]){this['needRefreshFrame']=!![];this['lightSpriteFrame'][0x0]=_0x1bd129;}};Game_QJLightLayerMini['prototype']['update']=function(){let _0x1e5db8=this['initData'];this['updateFrame']();if(this['time']>0x0)this['time']--;else if(this['time']==0x0){this['setDead']();return;}if(this['attach']['type']==0x0||this['attach']['type']==0x1){this['x']=this['attach']['x']+_0x1e5db8['offsetX']['get']();this['y']=this['attach']['y']+_0x1e5db8['offsetY']['get']();}else if(this['attach']['type']==0x2){if(this['attach']['object']['isDeadQJ']()){this['setDead']();return;}this['x']=this['attach']['object']['mapShowXQJ']()+_0x1e5db8['offsetX']['get']();this['y']=this['attach']['object']['mapShowYQJ']()+_0x1e5db8['offsetY']['get']();}this['scaleX']=_0x1e5db8['scaleX']['get']();this['scaleY']=_0x1e5db8['scaleY']['get']();this['opacity']=_0x1e5db8['opacity']['get']();if(this['attach']['synRotation']){this['rotation']=this['attach']['object']['lightRotation']();}else this['rotation']=_0x1e5db8['rotation']['get']();this['tint']=_0x1e5db8['tint']['get']();this['existTime']++;if(this['attach']['type']==0x1){let _0x39865f=![],_0x588d2a=this['attach']['regionId'];if(_0x1e5db8['showCondition']==0x0){_0x39865f=!![];}else if(_0x1e5db8['showCondition']==0x1){_0x39865f=$gamePlayer['remRegionId']==_0x588d2a;}else if(_0x1e5db8['showCondition']==0x2){_0x39865f=$gamePlayer['reSetX']==this['attach']['mapX']&&$gamePlayer['reSetY']==this['attach']['mapY'];}if(_0x19edd3[_0x588d2a]['showConditionExtra']){_0x39865f=_0x19edd3[_0x588d2a]['showConditionExtra']['call'](this,_0x39865f);}this['visible']=_0x39865f;}};Game_QJLightLayerMini['prototype']['setDead']=function(){$gameSystem['miniLights'][this['index']]=null;this['dead']=!![];};function _0x58384f(){this['initialize']['apply'](this,arguments);}_0x58384f['prototype']=Object['create'](PIXI['Sprite']['prototype']);_0x58384f['prototype']['constructor']=_0x58384f;_0x58384f['prototype']['initialize']=function(_0x31207d,_0x7638b6){this['parentSpriteset']=_0x31207d;this['odata']=_0x7638b6;this['initData']=_0x7638b6['initData'];this['character']=_0x7638b6['character'];this['oldScaleXRem']=0x0;this['oldScaleYRem']=0x0;this['onWallMode']=![];this['dead']=![];let _0x25763f=_0xbe1800[_0x7638b6['initData']['imgName']];this['dialogLength']=this['odata']['dialogLength'];PIXI['Sprite']['call'](this,new PIXI['RenderTexture']['create'](this['dialogLength'],this['dialogLength']));this['anchor']['set'](0.5,0.5);this['lightTexture']=new PIXI['Texture'](_0x25763f);this['shadowSprite']=new PIXI['Graphics']();this['shadowSprite']['isLightShadow']=!![];this['shadowSprite']['x']=this['dialogLength']/0x2;this['shadowSprite']['y']=this['dialogLength']/0x2;this['shadowTexture']=new PIXI['RenderTexture']['create'](this['dialogLength'],this['dialogLength']);this['_texture']['baseTexture']['sendTextureData']=[this['lightTexture'],this['shadowTexture']];this['_texture']['baseTexture']['sendRotationData']=[0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,this['odata']['lightSpriteFrame'],this['odata']['startX'],this['odata']['startY']];this['shadowSprite']['_webGL'][Graphics['_renderer']['plugins']['graphics']['CONTEXT_UID']]={'lastIndex':0x0,'data':[],'gl':Graphics['_renderer']['gl'],'clearDirty':-0x1,'dirty':-0x1};Graphics['_renderer']['textureManager']['updateTexture'](this['shadowTexture']['baseTexture'],0x0);this['shadowTexture']['baseTexture']['_glRenderTargets'][Graphics['_renderer']['CONTEXT_UID']]['clearColor']=[0x1,0x1,0x1,0x1];if(this['odata']['shadowCharacter']){this['characterShadowContainer']=new PIXI['Container']();this['characterShadowContainer']['csList']=[];}};_0x58384f['prototype']['update']=function(){if($gameSystem['eventLights'][this['character']]!=this['odata']){this['setDead']();return;}let _0x4ab44f=![],_0x4bd99e=![],_0x4ef249=!![];this['x']=this['odata']['x']+0x18-_0x3f5f67;this['y']=this['odata']['y']+0x18-_0x41dc67;_0x4ef249=this['odata']['visible']&&!(this['x']+this['dialogLength']/0x2<0x0||this['y']+this['dialogLength']/0x2<0x0||this['x']-this['dialogLength']/0x2>_0x1661f3||this['y']-this['dialogLength']/0x2>_0x512cb6);if(_0x4ef249!=this['visible']){this['visible']=_0x4ef249;if(this['visible']){if(this['characterShadowContainer'])this['characterShadowContainer']['visible']=!![];_0x4ab44f=!![];_0x4bd99e=!![];}else{if(this['characterShadowContainer'])this['characterShadowContainer']['visible']=![];}}if(!this['visible'])return;this['alpha']=this['odata']['opacity'];if(this['oldTint']!=this['odata']['tint']){this['tint']=Number('0x'+this['odata']['tint']['substr'](0x1));this['oldTint']=this['odata']['tint'];}if(this['oldScaleX']!=this['odata']['scaleX']||this['oldScaleY']!=this['odata']['scaleY']){this['oldScaleX']=this['odata']['scaleX'];this['oldScaleY']=this['odata']['scaleY'];this['scale']=new PIXI['ObservablePoint'](null,null,this['oldScaleX'],this['oldScaleY']);_0x4bd99e=!![];if(this['oldScaleX']>this['oldScaleXRem']||this['oldScaleY']>this['oldScaleYRem']){this['oldScaleXRem']=this['oldScaleX'];this['oldScaleYRem']=this['oldScaleY'];_0x4ab44f=!![];}}if(this['oldRotation']!=this['odata']['rotation']){this['oldRotation']=this['odata']['rotation'];this['rotation']=this['oldRotation'];_0x4bd99e=!![];}if(this['oldX']!=this['odata']['x']||this['oldY']!=this['odata']['y']){this['oldX']=this['odata']['x'];this['oldY']=this['odata']['y'];_0x4ab44f=!![];}if(_0x4bd99e)this['refreshShadowUvs']();if(_0x4ab44f)this['refreshShadowRegion']();};_0x58384f['prototype']['refreshShadowUvs']=function(){let _0x19b550=Math['sin'](this['rotation']),_0x2b87e9=Math['cos'](this['rotation']);this['_texture']['baseTexture']['sendRotationData'][0x0]=_0x19b550;this['_texture']['baseTexture']['sendRotationData'][0x1]=_0x2b87e9;this['_texture']['baseTexture']['sendRotationData'][0x2]=0.5-(_0x2b87e9*this['oldScaleX']-_0x19b550*this['oldScaleY'])*0.5/this['oldScaleXRem'];this['_texture']['baseTexture']['sendRotationData'][0x3]=0.5-(_0x19b550*this['oldScaleX']+_0x2b87e9*this['oldScaleY'])*0.5/this['oldScaleYRem'];this['_texture']['baseTexture']['sendRotationData'][0x4]=this['oldScaleX'];this['_texture']['baseTexture']['sendRotationData'][0x5]=this['oldScaleY'];this['_texture']['baseTexture']['sendRotationData'][0x6]=0x1/this['oldScaleXRem'];this['_texture']['baseTexture']['sendRotationData'][0x7]=0x1/this['oldScaleYRem'];};_0x58384f['prototype']['refreshShadowRegion']=function(){let _0x377797=this['shadowSprite'],_0x2ec8cb=this['oldX'],_0x3e9854=this['oldY'],_0x4d3d1a=this['dialogLength']/0x2,_0x318628=$gameMap['shadowDataQJLL'];let _0x32b7af=Math['floor'](_0x2ec8cb/0x30)*0x30-_0x2ec8cb-0x18,_0x25879d=Math['floor'](_0x3e9854/0x30)*0x30-_0x3e9854-0x18;let _0x33d093=this['oldScaleXRem'],_0x430d76=this['oldScaleYRem'];let _0x1d5561=Math['max'](Math['floor']((_0x2ec8cb-_0x4d3d1a*_0x33d093)/0x30),0x0),_0x280ddc=Math['min'](Math['floor']((_0x2ec8cb+_0x4d3d1a*_0x33d093)/0x30),$gameMap['width']()-0x1);let _0x4da88e=Math['max'](Math['floor']((_0x3e9854-_0x4d3d1a*_0x430d76)/0x30),0x0),_0x876b7a=Math['min'](Math['floor']((_0x3e9854+_0x4d3d1a*_0x430d76)/0x30),$gameMap['height']()-0x1);let _0x34ddad,_0x164b11,_0x55f7f7,_0x3f9727,_0x104926,_0x37bbfc,_0x58a32d,_0xb809bf=0xa,_0x575ef=0x0,_0x1ea7ae,_0x568f57;_0x377797['dirty']++;_0x377797['graphicsData']['length']=0x0;this['onWallMode']=_0x318628[Math['min'](Math['max'](Math['floor'](_0x2ec8cb/0x30),0x0),$gameMap['width']()-0x1)][Math['min'](Math['max'](Math['floor'](_0x3e9854/0x30),0x0),$gameMap['height']()-0x1)];let _0xf641d5=0x0,_0x385bee;for(let _0x4e43f4=_0x1d5561;_0x4e43f4<=_0x280ddc;_0x4e43f4++){for(let _0x91faf8=_0x4da88e;_0x91faf8<=_0x876b7a;_0x91faf8++){if(_0x318628[_0x4e43f4][_0x91faf8]==-0x1)continue;_0x34ddad=$gameMap['regionIdForShadow'](_0x4e43f4,_0x91faf8);if(_0x2b8ad5[_0x34ddad]&&_0x2b8ad5[_0x34ddad]['shadowShow']){_0x37bbfc=_0x4e43f4*0x30-_0x2ec8cb-0x18;_0x58a32d=_0x91faf8*0x30-_0x3e9854-0x18;if(_0x37bbfc<0x0&&_0x58a32d<0x0&&_0x37bbfc>-0x30&&_0x58a32d>-0x30)continue;_0x575ef=_0x2b8ad5[_0x34ddad]['shadowHeight'];if(this['onWallMode']!=-0x1){_0x385bee=_0x318628[_0x4e43f4][_0x91faf8];if(_0x385bee!=_0x91faf8&&_0x385bee==this['onWallMode']){_0x377797['graphicsData']['push'](new PIXI['GraphicsData'](0x0,0x0,0x0,[0x1,0x1,0x1],0x1,!![],![],new PIXI['Polygon']([(_0x37bbfc+0x30)/_0x33d093,_0x58a32d/_0x430d76,(_0x37bbfc+0x30)/_0x33d093,(_0x58a32d+_0x575ef*0x30+0x30)/_0x430d76,_0x37bbfc/_0x33d093,(_0x58a32d+_0x575ef*0x30+0x30)/_0x430d76,_0x37bbfc/_0x33d093,_0x58a32d/_0x430d76])));_0x91faf8=_0x385bee;}else{_0x58a32d+=_0x575ef*0x30;if(_0x91faf8+_0x575ef-this['onWallMode']==0x1){if(_0x37bbfc>=0x0&&_0x58a32d>=0x0){_0x164b11=_0x37bbfc/_0x33d093;_0x55f7f7=(_0x58a32d+0x30)/_0x430d76;_0x3f9727=(_0x37bbfc+0x30)/_0x33d093;_0x104926=_0x58a32d/_0x430d76;_0x377797['graphicsData']['unshift'](new PIXI['GraphicsData'](0x0,0x0,0x0,_0x2b8ad5[_0x34ddad]['shadowTint'],_0x2b8ad5[_0x34ddad]['shadowOpacity'],!![],![],new PIXI['Polygon']([_0x164b11*_0xb809bf,_0x55f7f7*_0xb809bf,_0x164b11,_0x55f7f7,_0x164b11,_0x104926,_0x4d3d1a,_0x104926])));}else if(_0x37bbfc<=-0x30&&_0x58a32d>=0x0){_0x164b11=_0x37bbfc/_0x33d093;_0x55f7f7=_0x58a32d/_0x430d76;_0x3f9727=(_0x37bbfc+0x30)/_0x33d093;_0x104926=(_0x58a32d+0x30)/_0x430d76;_0x377797['graphicsData']['unshift'](new PIXI['GraphicsData'](0x0,0x0,0x0,_0x2b8ad5[_0x34ddad]['shadowTint'],_0x2b8ad5[_0x34ddad]['shadowOpacity'],!![],![],new PIXI['Polygon']([-_0x4d3d1a,_0x55f7f7,_0x3f9727,_0x55f7f7,_0x3f9727,_0x104926,_0x3f9727*_0xb809bf,_0x104926*_0xb809bf])));}}else{if(_0x37bbfc>=0x0&&_0x58a32d>=0x0){_0x164b11=_0x37bbfc/_0x33d093;_0x55f7f7=(_0x58a32d+0x30)/_0x430d76;_0x3f9727=(_0x37bbfc+0x30)/_0x33d093;_0x104926=_0x58a32d/_0x430d76;_0x377797['graphicsData']['unshift'](new PIXI['GraphicsData'](0x0,0x0,0x0,_0x2b8ad5[_0x34ddad]['shadowTint'],_0x2b8ad5[_0x34ddad]['shadowOpacity'],!![],![],new PIXI['Polygon']([_0x164b11*_0xb809bf,_0x55f7f7*_0xb809bf,_0x164b11,_0x55f7f7,_0x3f9727,_0x104926,_0x3f9727*_0xb809bf,_0x104926*_0xb809bf])));}else if(_0x37bbfc<=-0x30&&_0x58a32d>=0x0){_0x164b11=_0x37bbfc/_0x33d093;_0x55f7f7=_0x58a32d/_0x430d76;_0x3f9727=(_0x37bbfc+0x30)/_0x33d093;_0x104926=(_0x58a32d+0x30)/_0x430d76;_0x377797['graphicsData']['unshift'](new PIXI['GraphicsData'](0x0,0x0,0x0,_0x2b8ad5[_0x34ddad]['shadowTint'],_0x2b8ad5[_0x34ddad]['shadowOpacity'],!![],![],new PIXI['Polygon']([_0x164b11*_0xb809bf,_0x55f7f7*_0xb809bf,_0x164b11,_0x55f7f7,_0x3f9727,_0x104926,_0x3f9727*_0xb809bf,_0x104926*_0xb809bf])));}else if(_0x58a32d>=0x0){_0x164b11=_0x37bbfc/_0x33d093;_0x55f7f7=_0x58a32d/_0x430d76;_0x3f9727=(_0x37bbfc+0x30)/_0x33d093;_0x104926=_0x58a32d/_0x430d76;_0x377797['graphicsData']['unshift'](new PIXI['GraphicsData'](0x0,0x0,0x0,_0x2b8ad5[_0x34ddad]['shadowTint'],_0x2b8ad5[_0x34ddad]['shadowOpacity'],!![],![],new PIXI['Polygon']([_0x164b11*_0xb809bf,_0x55f7f7*_0xb809bf,_0x164b11,_0x55f7f7,_0x3f9727,_0x104926,_0x3f9727*_0xb809bf,_0x104926*_0xb809bf])));}}_0x377797['graphicsData']['unshift'](new PIXI['GraphicsData'](0x0,0x0,0x0,_0x2b8ad5[_0x34ddad]['shadowTint'],_0x2b8ad5[_0x34ddad]['shadowOpacity'],!![],![],new PIXI['Polygon']([(_0x37bbfc+0x30)/_0x33d093,_0x58a32d/_0x430d76,(_0x37bbfc+0x30)/_0x33d093,(_0x58a32d+0x30)/_0x430d76,_0x37bbfc/_0x33d093,(_0x58a32d+0x30)/_0x430d76,_0x37bbfc/_0x33d093,_0x58a32d/_0x430d76])));}continue;}else{_0x58a32d+=_0x575ef*0x30;if(_0x37bbfc>=0x0&&_0x58a32d>=0x0){_0x164b11=_0x37bbfc/_0x33d093;_0x55f7f7=(_0x58a32d+0x30)/_0x430d76;_0x3f9727=(_0x37bbfc+0x30)/_0x33d093;_0x104926=_0x58a32d/_0x430d76;}else if(_0x37bbfc<=-0x30&&_0x58a32d>=0x0){_0x164b11=_0x37bbfc/_0x33d093;_0x55f7f7=_0x58a32d/_0x430d76;_0x3f9727=(_0x37bbfc+0x30)/_0x33d093;_0x104926=(_0x58a32d+0x30)/_0x430d76;}else if(_0x58a32d>=0x0){_0x164b11=_0x37bbfc/_0x33d093;_0x55f7f7=_0x58a32d/_0x430d76;_0x3f9727=(_0x37bbfc+0x30)/_0x33d093;_0x104926=_0x58a32d/_0x430d76;}else if(_0x37bbfc>=0x0&&_0x58a32d<=-0x30){_0x164b11=(_0x37bbfc+0x30)/_0x33d093;_0x55f7f7=(_0x58a32d+0x30)/_0x430d76;_0x3f9727=_0x37bbfc/_0x33d093;_0x104926=_0x58a32d/_0x430d76;}else if(_0x37bbfc>=0x0){_0x164b11=_0x37bbfc/_0x33d093;_0x55f7f7=(_0x58a32d+0x30)/_0x430d76;_0x3f9727=_0x37bbfc/_0x33d093;_0x104926=_0x58a32d/_0x430d76;}else if(_0x37bbfc<=-0x30&&_0x58a32d<=-0x30){_0x164b11=(_0x37bbfc+0x30)/_0x33d093;_0x55f7f7=_0x58a32d/_0x430d76;_0x3f9727=_0x37bbfc/_0x33d093;_0x104926=(_0x58a32d+0x30)/_0x430d76;}else if(_0x37bbfc<=-0x30){_0x164b11=(_0x37bbfc+0x30)/_0x33d093;_0x55f7f7=_0x58a32d/_0x430d76;_0x3f9727=(_0x37bbfc+0x30)/_0x33d093;_0x104926=(_0x58a32d+0x30)/_0x430d76;}else if(_0x58a32d<=-0x30){_0x164b11=(_0x37bbfc+0x30)/_0x33d093;_0x55f7f7=(_0x58a32d+0x30)/_0x430d76;_0x3f9727=_0x37bbfc/_0x33d093;_0x104926=(_0x58a32d+0x30)/_0x430d76;}_0x377797['graphicsData']['unshift'](new PIXI['GraphicsData'](0x0,0x0,0x0,_0x2b8ad5[_0x34ddad]['shadowTint'],_0x2b8ad5[_0x34ddad]['shadowOpacity'],!![],![],new PIXI['Polygon']([_0x164b11*_0xb809bf,_0x55f7f7*_0xb809bf,_0x164b11,_0x55f7f7,_0x3f9727,_0x104926,_0x3f9727*_0xb809bf,_0x104926*_0xb809bf])));_0xf641d5++;if(_0x3e9854>_0x91faf8*0x30-0x18+0x30+_0x2b8ad5[_0x34ddad]['shadowHeight']*0x30){for(let _0x38d2ee=0x0,_0x554bb2=_0x2b8ad5[_0x34ddad]['shadowHeight'];_0x38d2ee<_0x554bb2;_0x38d2ee++){if($gameMap['regionIdForShadow'](_0x4e43f4,_0x91faf8+_0x38d2ee+0x1)==_0x34ddad){_0x575ef=_0x38d2ee;break;}_0x58a32d=_0x91faf8*0x30-_0x3e9854-0x18+0x30+_0x38d2ee*0x30;_0x377797['graphicsData']['push'](new PIXI['GraphicsData'](0x0,0x0,0x0,[0x1,0x1,0x1],0x1,!![],![],new PIXI['Polygon']([_0x37bbfc/_0x33d093,_0x58a32d/_0x430d76,(_0x37bbfc+0x30)/_0x33d093,_0x58a32d/_0x430d76,(_0x37bbfc+0x30)/_0x33d093,(_0x58a32d+0x30)/_0x430d76,_0x37bbfc/_0x33d093,(_0x58a32d+0x30)/_0x430d76])));}}else{_0x568f57=_0x91faf8*0x30-0x18+0x30+_0x2b8ad5[_0x34ddad]['shadowHeight']*0x30;_0x1ea7ae=0x1-(_0x568f57-_0x3e9854<=0x18&&_0x568f57>=_0x3e9854?Math['abs'](_0x568f57-_0x3e9854)/0x18:0x1);for(let _0x1d2eab=0x0,_0xde796e=_0x2b8ad5[_0x34ddad]['shadowHeight'];_0x1d2eab<_0xde796e;_0x1d2eab++){if($gameMap['regionIdForShadow'](_0x4e43f4,_0x91faf8+_0x1d2eab+0x1)==_0x34ddad){_0x575ef=_0x1d2eab;break;}_0x58a32d=_0x91faf8*0x30-_0x3e9854-0x18+0x30+_0x1d2eab*0x30;_0x377797['graphicsData']['push'](new PIXI['GraphicsData'](0x0,0x0,0x0,[_0x1ea7ae,_0x1ea7ae,_0x1ea7ae],0x1,!![],![],new PIXI['Polygon']([_0x37bbfc/_0x33d093,_0x58a32d/_0x430d76,(_0x37bbfc+0x30)/_0x33d093,_0x58a32d/_0x430d76,(_0x37bbfc+0x30)/_0x33d093,(_0x58a32d+0x30)/_0x430d76,_0x37bbfc/_0x33d093,(_0x58a32d+0x30)/_0x430d76])));}}_0x91faf8+=_0x575ef;}}}}if(this['onWallMode']!=-0x1){_0x58a32d=(this['onWallMode']*0x30-_0x3e9854-0x18+0x30)/_0x430d76;_0x377797['graphicsData']['splice'](_0xf641d5,0x0,new PIXI['GraphicsData'](0x0,0x0,0x0,[0x0,0x0,0x0],0x1,!![],![],new PIXI['Polygon']([_0x4d3d1a,-_0x4d3d1a,_0x4d3d1a,_0x58a32d,-_0x4d3d1a,_0x58a32d,-_0x4d3d1a,-_0x4d3d1a])));}Graphics['_renderer']['render'](this['shadowSprite'],this['shadowTexture']);};_0x58384f['prototype']['setDead']=function(){if(this['characterShadowContainer']){this['characterShadowContainer']['parent']['removeChild'](this['characterShadowContainer']);}this['parent']['removeChild'](this);this['destroy']();this['dead']=!![];};function _0x37a865(){this['initialize']['apply'](this,arguments);}_0x37a865['prototype']=Object['create'](PIXI['Sprite']['prototype']);_0x37a865['prototype']['constructor']=_0x37a865;_0x37a865['prototype']['initialize']=function(_0x55bf37,_0x6b57ad){this['parentSpriteset']=_0x55bf37;this['odata']=_0x6b57ad;this['initData']=_0x6b57ad['initData'];this['index']=_0x6b57ad['index'];this['dead']=![];PIXI['Sprite']['call'](this,new PIXI['Texture'](_0xbe1800[_0x6b57ad['initData']['imgName']]));this['anchor']['set'](0.5,0.5);this['update']();};_0x37a865['prototype']['update']=function(){if($gameSystem['miniLights'][this['index']]!=this['odata']){this['setDead']();return;}this['x']=this['odata']['x']-_0x3f5f67;this['y']=this['odata']['y']-_0x41dc67;this['alpha']=this['odata']['opacity'];this['visible']=this['odata']['visible'];if(this['oldTint']!=this['odata']['tint']){this['tint']=Number('0x'+this['odata']['tint']['substr'](0x1));this['oldTint']=this['odata']['tint'];}if(this['oldScaleX']!=this['odata']['scaleX']||this['oldScaleY']!=this['odata']['scaleY']){this['oldScaleX']=this['odata']['scaleX'];this['oldScaleY']=this['odata']['scaleY'];this['scale']=new PIXI['ObservablePoint'](null,null,this['oldScaleX'],this['oldScaleY']);}if(this['oldRotation']!=this['odata']['rotation']){this['oldRotation']=this['odata']['rotation'];this['rotation']=this['oldRotation'];}if(this['odata']['needRefreshFrame']){this['odata']['needRefreshFrame']=![];this['texture']['frame']['x']=this['odata']['lightSpriteFrame'][0x0];this['texture']['frame']['width']=this['odata']['lightSpriteFrame'][0x2];this['texture']['frame']=this['texture']['frame'];}};_0x37a865['prototype']['setDead']=function(){this['parent']['removeChild'](this);this['destroy']();this['dead']=!![];};const _0x117c30=PIXI['GraphicsRenderer']['prototype']['updateGraphics'];PIXI['GraphicsRenderer']['prototype']['updateGraphics']=function(_0x5087a4){if(!_0x5087a4['isLightShadow'])return _0x117c30['call'](this,_0x5087a4);let _0x481f52=_0x5087a4['_webGL'][this['CONTEXT_UID']];let _0x56c561=void 0x0;_0x481f52['dirty']=_0x5087a4['dirty'];this['renderer']['bindVao'](null);if(_0x481f52['data'][0x0]){_0x56c561=_0x481f52['data'][0x0];_0x56c561['reset'](0x0);}else _0x56c561=this['getWebGLData'](_0x481f52,0x0);for(let _0x2c1ba6=0x0,_0x3a82bd=_0x5087a4['graphicsData']['length'],_0x1a12fe,_0x475d13=[0x1,0x0,0x3,0x3,0x2,0x1],_0x547bed,_0x4ebe10;_0x2c1ba6<_0x3a82bd;_0x2c1ba6++){_0x1a12fe=_0x5087a4['graphicsData'][_0x2c1ba6];points=_0x1a12fe['shape']['points']['slice']();_0x547bed=_0x1a12fe['fillColor'];_0x4ebe10=_0x1a12fe['fillAlpha'];for(let _0x2e40d7=0x0,_0x496fb7=_0x56c561['points']['length']/0x6;_0x2e40d7<_0x475d13['length'];_0x2e40d7+=0x3){_0x56c561['indices']['push'](_0x475d13[_0x2e40d7]+_0x496fb7,_0x475d13[_0x2e40d7]+_0x496fb7,_0x475d13[_0x2e40d7+0x1]+_0x496fb7,_0x475d13[_0x2e40d7+0x2]+_0x496fb7,_0x475d13[_0x2e40d7+0x2]+_0x496fb7);}for(let _0x1a260a=0x0,_0x403d0f=points['length']/0x2;_0x1a260a<_0x403d0f;_0x1a260a++){_0x56c561['points']['push'](points[_0x1a260a*0x2],points[_0x1a260a*0x2+0x1],_0x547bed[0x0]*_0x4ebe10,_0x547bed[0x1]*_0x4ebe10,_0x547bed[0x2]*_0x4ebe10,_0x4ebe10);}}_0x56c561['upload']();};_0x43114b['prototype']['renderWebGL']=function _0x108352(_0x386024){if(this['visible'])this['renderAdvancedWebGL'](_0x386024);};_0x43114b['prototype']['renderAdvancedWebGL']=function _0xde2033(_0x3fa7b0){_0x3fa7b0['flush']();var _0x4d0757=this['_filters'];if(_0x4d0757){if(!this['_enabledFilters']){this['_enabledFilters']=[];}this['_enabledFilters']['length']=0x0;for(var _0x2c83d9=0x0;_0x2c83d9<_0x4d0757['length'];_0x2c83d9++){if(_0x4d0757[_0x2c83d9]['enabled']){this['_enabledFilters']['push'](_0x4d0757[_0x2c83d9]);}}if(this['_enabledFilters']['length']){_0x3fa7b0['filterManager']['pushFilter'](this,this['_enabledFilters']);}}this['_renderWebGL'](_0x3fa7b0);if(this['children']['length']>0x1){_0x3fa7b0['plugins']['sprite']['lightShadowMode']=!![];for(var _0x137c89=0x0,_0x46930b=this['children']['length']-0x2;_0x137c89<_0x46930b;_0x137c89++){this['children'][_0x137c89]['renderWebGL'](_0x3fa7b0);}_0x3fa7b0['plugins']['sprite']['flush']();_0x3fa7b0['plugins']['sprite']['start']();}_0x3fa7b0['plugins']['sprite']['lightShadowMode']=![];this['children'][this['children']['length']-0x2]['renderWebGL'](_0x3fa7b0);this['children'][this['children']['length']-0x1]['renderWebGL'](_0x3fa7b0);_0x3fa7b0['flush']();if(_0x4d0757&&this['_enabledFilters']&&this['_enabledFilters']['length']){_0x3fa7b0['filterManager']['popFilter']();}};QJ['LL']['nextPow2']=function(_0x3ab777){_0x3ab777+=_0x3ab777===0x0;--_0x3ab777;_0x3ab777|=_0x3ab777>>>0x1;_0x3ab777|=_0x3ab777>>>0x2;_0x3ab777|=_0x3ab777>>>0x4;_0x3ab777|=_0x3ab777>>>0x8;_0x3ab777|=_0x3ab777>>>0x10;return _0x3ab777+0x1;};QJ['LL']['log2']=function(_0x5f46d5){var _0x3dd0f2,_0x11b33c;_0x3dd0f2=(_0x5f46d5>0xffff)<<0x4;_0x5f46d5>>>=_0x3dd0f2;_0x11b33c=(_0x5f46d5>0xff)<<0x3;_0x5f46d5>>>=_0x11b33c;_0x3dd0f2|=_0x11b33c;_0x11b33c=(_0x5f46d5>0xf)<<0x2;_0x5f46d5>>>=_0x11b33c;_0x3dd0f2|=_0x11b33c;_0x11b33c=(_0x5f46d5>0x3)<<0x1;_0x5f46d5>>>=_0x11b33c;_0x3dd0f2|=_0x11b33c;return _0x3dd0f2|_0x5f46d5>>0x1;};var _0xa166f6=0x0;var _0xedb7e1=0x0;const _0x33434c=PIXI['SpriteRenderer']['prototype']['flush'];PIXI['SpriteRenderer']['prototype']['flush']=function(){if(!this['lightShadowMode'])return _0x33434c['call'](this);if(this['currentIndex']===0x0)return;Graphics['_renderer']['bindShader'](Graphics['lssQJLL']);var _0x328c12=this['renderer']['gl'];var _0x3e533e=this['MAX_TEXTURES'];var _0x44ac66=this['buffers'][QJ['LL']['log2'](QJ['LL']['nextPow2'](this['currentIndex']))];var _0x5d3985=this['sprites'];var _0x3def18=this['groups'];var _0x20c22a=_0x44ac66['float32View'];var _0x45f5cc=_0x44ac66['uint32View'];var _0x2421c8=this['boundTextures'];var _0x107df3=this['renderer']['boundTextures'];var _0x1a6d06=this['renderer']['textureGC']['count'];var _0x44577e=0x0;var _0x243be0=void 0x0;var _0x9a7a15=void 0x0;var _0x4878db=0x1;var _0x6519bb=0x0;var _0x3d8eb9=_0x3def18[0x0];var _0x3b5700=void 0x0;var _0x1878a7=void 0x0;var _0x16539c=PIXI['utils']['premultiplyBlendMode'][0x1][_0x5d3985[0x0]['blendMode']];_0x3d8eb9['textureCount']=0x0;_0x3d8eb9['start']=0x0;_0x3d8eb9['blend']=_0x16539c;_0xa166f6++;var _0x1303a2=void 0x0;for(_0x1303a2=0x0;_0x1303a2<_0x3e533e;++_0x1303a2){_0x2421c8[_0x1303a2]=_0x107df3[_0x1303a2];_0x2421c8[_0x1303a2]['_virtalBoundId']=_0x1303a2;}for(_0x1303a2=0x0;_0x1303a2<this['currentIndex'];++_0x1303a2){var _0xf718f5=_0x5d3985[_0x1303a2];_0x243be0=_0xf718f5['_texture']['baseTexture'];var _0x290f27=PIXI['utils']['premultiplyBlendMode'][Number(_0x243be0['premultipliedAlpha'])][_0xf718f5['blendMode']];_0x16539c=_0x290f27;_0x9a7a15=null;_0x6519bb=_0x3e533e;_0xa166f6++;if(_0x9a7a15!==_0x243be0){_0x9a7a15=_0x243be0;if(_0x243be0['_enabled']!==_0xa166f6){if(_0x6519bb===_0x3e533e){_0xa166f6++;_0x3d8eb9['size']=_0x1303a2-_0x3d8eb9['start'];_0x6519bb=0x0;_0x3d8eb9=_0x3def18[_0x4878db++];_0x3d8eb9['blend']=_0x16539c;_0x3d8eb9['textureCount']=0x0;_0x3d8eb9['start']=_0x1303a2;}_0x243be0['touched']=_0x1a6d06;if(_0x243be0['_virtalBoundId']===-0x1){for(var _0x32f4cf=0x0;_0x32f4cf<_0x3e533e;++_0x32f4cf){var _0x1cec8e=(_0x32f4cf+_0xedb7e1)%_0x3e533e;var _0xe95552=_0x2421c8[_0x1cec8e];if(_0xe95552['_enabled']!==_0xa166f6){_0xedb7e1++;_0xe95552['_virtalBoundId']=-0x1;_0x243be0['_virtalBoundId']=_0x1cec8e;_0x2421c8[_0x1cec8e]=_0x243be0;break;}}}_0x243be0['_enabled']=_0xa166f6;_0x3d8eb9['textureCount']++;_0x3d8eb9['ids'][_0x6519bb]=_0x243be0['_virtalBoundId'];_0x3d8eb9['textures'][_0x6519bb++]=_0x243be0;}}_0x3b5700=_0xf718f5['vertexData'];_0x1878a7=_0xf718f5['_texture']['_uvs']['uvsUint32'];_0x20c22a[_0x44577e]=_0x3b5700[0x0];_0x20c22a[_0x44577e+0x1]=_0x3b5700[0x1];_0x20c22a[_0x44577e+0x5]=_0x3b5700[0x2];_0x20c22a[_0x44577e+0x6]=_0x3b5700[0x3];_0x20c22a[_0x44577e+0xa]=_0x3b5700[0x4];_0x20c22a[_0x44577e+0xb]=_0x3b5700[0x5];_0x20c22a[_0x44577e+0xf]=_0x3b5700[0x6];_0x20c22a[_0x44577e+0x10]=_0x3b5700[0x7];_0x45f5cc[_0x44577e+0x2]=_0x1878a7[0x0];_0x45f5cc[_0x44577e+0x7]=_0x1878a7[0x1];_0x45f5cc[_0x44577e+0xc]=_0x1878a7[0x2];_0x45f5cc[_0x44577e+0x11]=_0x1878a7[0x3];var _0x435a5e=Math['min'](_0xf718f5['worldAlpha'],0x1);var _0x23bba3=_0x435a5e<0x1&&_0x243be0['premultipliedAlpha']?(0x0,PIXI['utils']['premultiplyTint'])(_0xf718f5['_tintRGB'],_0x435a5e):_0xf718f5['_tintRGB']+(_0x435a5e*0xff<<0x18);_0x45f5cc[_0x44577e+0x3]=_0x45f5cc[_0x44577e+0x8]=_0x45f5cc[_0x44577e+0xd]=_0x45f5cc[_0x44577e+0x12]=_0x23bba3;_0x20c22a[_0x44577e+0x4]=_0x20c22a[_0x44577e+0x9]=_0x20c22a[_0x44577e+0xe]=_0x20c22a[_0x44577e+0x13]=_0x243be0['_virtalBoundId'];_0x44577e+=0x14;}_0x3d8eb9['size']=_0x1303a2-_0x3d8eb9['start'];this['vertexBuffers'][this['vertexCount']]['upload'](_0x44ac66['vertices'],0x0,!![]);for(_0x1303a2=0x0;_0x1303a2<_0x3e533e;++_0x1303a2){_0x107df3[_0x1303a2]['_virtalBoundId']=-0x1;}var _0x138cef=Graphics['lssQJLL']['uniforms'];_0x328c12['blendFunc'](_0x328c12['SRC_ALPHA'],_0x328c12['ONE']);for(_0x1303a2=0x0;_0x1303a2<_0x4878db;++_0x1303a2){var _0x42ff64=_0x3def18[_0x1303a2];var _0x4ffd34=_0x42ff64['textureCount'];for(var _0x906806=0x0;_0x906806<_0x4ffd34;_0x906806++){_0x9a7a15=_0x42ff64['textures'][_0x906806];this['renderer']['bindTexture'](_0x9a7a15['sendTextureData'][0x0],0x0,!![]);this['renderer']['bindTexture'](_0x9a7a15['sendTextureData'][0x1],0x1,!![]);_0x9a7a15['_virtalBoundId']=-0x1;}var _0x5d0d0f=_0x9a7a15['sendRotationData'];_0x138cef['sRSin']=_0x5d0d0f[0x0];_0x138cef['sRCos']=_0x5d0d0f[0x1];_0x138cef['sROffsetX']=_0x5d0d0f[0x2];_0x138cef['sROffsetY']=_0x5d0d0f[0x3];_0x138cef['sRScaleX']=_0x5d0d0f[0x4];_0x138cef['sRScaleY']=_0x5d0d0f[0x5];_0x138cef['sRScaleX2']=_0x5d0d0f[0x6];_0x138cef['sRScaleY2']=_0x5d0d0f[0x7];_0x138cef['frameX']=_0x5d0d0f[0x8][0x0];_0x138cef['frameY']=_0x5d0d0f[0x8][0x1];_0x138cef['frameW']=_0x5d0d0f[0x8][0x2];_0x138cef['frameH']=_0x5d0d0f[0x8][0x3];_0x138cef['startX']=_0x5d0d0f[0x9];_0x138cef['startY']=_0x5d0d0f[0xa];_0x328c12['drawElements'](_0x328c12['TRIANGLES'],_0x42ff64['size']*0x6,_0x328c12['UNSIGNED_SHORT'],_0x42ff64['start']*0x6*0x2);}this['currentIndex']=0x0;};function _0x20520f(){this['initialize']['apply'](this,arguments);}_0x20520f['prototype']=Object['create'](PIXI['Container']['prototype']);_0x20520f['prototype']['constructor']=_0x20520f;_0x20520f['prototype']['initialize']=function(_0x1e7bb7){PIXI['Container']['call'](this);this['mainMask']=_0x1e7bb7;this['z']=0x1;};_0x20520f['prototype']['update']=function(){this['visible']=$gameSystem['showLights'];if(!this['visible'])return;let _0x4789e0=this['mainMask']['children'];let _0x3d837d,_0x278321,_0xfcf352,_0xdf388a,_0x5af991,_0x240e64,_0xab7921,_0x2d9882,_0x5f32e6;let _0x38b8c1=$gameMap['characterShadowList'];let _0x106b3d,_0x122d68,_0x3acd78,_0x41d213,_0x4900c7,_0x42ff13;for(let _0x464dbb=0x0,_0x3f2381=_0x4789e0['length']-0x1;_0x464dbb<_0x3f2381;_0x464dbb++){if(!_0x4789e0[_0x464dbb]||!_0x4789e0[_0x464dbb]['characterShadowContainer'])continue;_0x3d837d=_0x4789e0[_0x464dbb]['characterShadowContainer'];if(!_0x3d837d['parent'])this['addChild'](_0x3d837d);_0x106b3d=_0x4789e0[_0x464dbb]['x']-_0x54ffa6/0x2;_0x122d68=_0x4789e0[_0x464dbb]['y']-_0x54ffa6/0x2;_0x278321=_0x4789e0[_0x464dbb]['initData'];_0x240e64=_0x4789e0[_0x464dbb]['odata'];for(let _0x2ee0b9 in _0x38b8c1){if(_0x2ee0b9==_0x4789e0[_0x464dbb]['character'])continue;if(_0x38b8c1[_0x2ee0b9]==![]){if(_0x3d837d['csList'][_0x2ee0b9]){_0x3d837d['removeChild'](_0x3d837d['csList'][_0x2ee0b9]);delete _0x3d837d['csList'][_0x2ee0b9];}continue;}if(!_0x3d837d['csList'][_0x2ee0b9]){_0xdf388a=new PIXI['Sprite']();_0xdf388a['blendMode']=0x2;_0xdf388a['anchor']['set'](0.5,0x1);_0x3d837d['addChild'](_0xdf388a);_0x3d837d['csList'][_0x2ee0b9]=_0xdf388a;}else _0xdf388a=_0x3d837d['csList'][_0x2ee0b9];_0x5af991=_0x370663[_0x2ee0b9];if(!_0x5af991)continue;_0xab7921=_0x5af991['_character'];_0x5f32e6=_0xab7921['jumpHeight']();_0xfcf352=_0xab7921['QJSC'];_0x3acd78=_0xab7921['screenX']();_0x41d213=_0xab7921['screenY']()-_0xfcf352['yCut']+_0x5f32e6;_0x2d9882=QJ['LL']['calculateAngleByTwoPoint'](_0x106b3d,_0x122d68,_0x3acd78-_0x240e64['shadowCharacterOffsetX'],_0x41d213-_0x240e64['shadowCharacterOffsetY']);_0x3acd78+=Math['sin'](_0x2d9882)*_0x5f32e6;_0x41d213+=-Math['cos'](_0x2d9882)*_0x5f32e6;_0x4900c7=Math['sqrt']((_0x3acd78-_0x240e64['shadowCharacterOffsetX']-_0x106b3d)*(_0x3acd78-_0x240e64['shadowCharacterOffsetX']-_0x106b3d)+(_0x41d213-_0x240e64['shadowCharacterOffsetY']-_0x122d68)*(_0x41d213-_0x240e64['shadowCharacterOffsetY']-_0x122d68))+_0x5f32e6;if(_0x4900c7>_0x4789e0[_0x464dbb]['dialogLength']/0x2){_0xdf388a['visible']=![];continue;}else _0xdf388a['visible']=!![];if(!_0xfcf352['imgName']){if(!_0x5af991['textureLL'])continue;if(_0xdf388a['texture']!=_0x5af991['textureLL'])_0xdf388a['texture']=_0x5af991['textureLL'];if(_0xdf388a['texture']['frame']['x']!=_0x5af991['_frame']['x']||_0xdf388a['texture']['frame']['y']!=_0x5af991['_frame']['y']||_0xdf388a['texture']['frame']['width']!=_0x5af991['_frame']['width']||_0xdf388a['texture']['frame']['height']!=_0x5af991['_frame']['height']-_0xfcf352['yCut']){_0xdf388a['texture']['frame']['x']=_0x5af991['_frame']['x'];_0xdf388a['texture']['frame']['y']=_0x5af991['_frame']['y'];_0xdf388a['texture']['frame']['width']=_0x5af991['_frame']['width'];_0xdf388a['texture']['frame']['height']=_0x5af991['_frame']['height']-_0xfcf352['yCut'];_0x5af991['textureLL']['frame']=_0x5af991['textureLL']['frame'];}}else{if(!_0x5af991['textureLLSpecial'])continue;if(_0xdf388a['texture']!=_0x5af991['textureLLSpecial']){_0xdf388a['texture']=_0x5af991['textureLLSpecial'];}}_0x42ff13=_0xab7921['direction']();_0xdf388a['tint']=_0xfcf352['tint'];_0xdf388a['x']=_0x3acd78+_0xfcf352['offsetX']+_0xfcf352['offsetDirX'][_0x42ff13];_0xdf388a['y']=_0x41d213+_0xfcf352['offsetY']+_0xfcf352['offsetDirY'][_0x42ff13];_0xdf388a['alpha']=Math['floor'](_0xfcf352['opacity']*_0x278321['shadowCharacterMaxOpacity']*0x64*Math['min'](0x1,Math['max'](0x1-_0x4900c7/_0x278321['shadowCharacterMaxDistance'])))/0x64;if(_0xfcf352['model'][0x0]==0x0){_0xdf388a['rotation']=_0x2d9882;_0xdf388a['skew']['x']=0x0;}else{_0xdf388a['rotation']=0x0;_0xdf388a['skew']['x']=-_0x2d9882;}_0xdf388a['scale']['y']=_0x4789e0[_0x464dbb]['odata']['shadowCharacterShakeX'];if(_0xfcf352['model'][0x1]==0x0){}else if(_0xfcf352['model'][0x1]==0x1){_0xdf388a['scale']['y']*=_0x4900c7/_0xfcf352['model'][0x2];}else if(_0xfcf352['model'][0x1]==0x2){_0xdf388a['scale']['y']*=Math['min'](Math['max'](0x2-_0x4900c7/_0xfcf352['model'][0x2],0.1),0x2);}}}};QJFrameLight['prototype']['initialize']=function(_0x104b0a,_0x4287b4,_0x8ab4d9,_0x3c30ea){_0x3c30ea=_0x3c30ea||![];this['i']=_0x8ab4d9;this['n']=_0x104b0a;this['d']={};this['m']=0x0;this['t']=0x0;this['rt']=0x0;this['isMode']=!![];if(typeof _0x4287b4=='string'&&_0x4287b4['includes']('~')){let _0x13659c=_0x4287b4['split']('~'),_0x261965=0x0,_0x28dcc1=0x0,_0x4fcc15;for(let _0x45743b=0x0,_0xb0cb4=_0x13659c['length'],_0x49c560;_0x45743b<_0xb0cb4;_0x45743b++){if(_0x13659c[_0x45743b]['includes']('|')){_0x49c560=_0x13659c[_0x45743b]['split']('|');if(_0x8ab4d9==0x0)_0x261965=Number(_0x49c560[0x1]);else if(_0x8ab4d9==0x1)_0x261965=_0x49c560[0x1];else if(_0x8ab4d9==0x2)_0x261965=Number(_0x49c560[0x1])*Math['PI']/0xb4;this['d'][this['m']]=_0x261965;if(_0x3c30ea){for(let _0x173c5e=this['m'],_0x288e7b=Number(_0x49c560[0x0]);_0x173c5e<_0x288e7b;_0x173c5e++){this['d'][_0x173c5e]=_0x261965;}}this['m']+=Number(_0x49c560[0x0]);this['d'][this['m']]=_0x261965;}else if(_0x13659c[_0x45743b]['includes']('/')){_0x49c560=_0x13659c[_0x45743b]['split']('/');_0x28dcc1=Number(_0x49c560[0x0]);if(_0x8ab4d9==0x0){_0x261965=Number(_0x49c560[0x1]);_0x4fcc15=this['d'][this['m']];for(let _0x56ceba=0x1;_0x56ceba<=_0x28dcc1;_0x56ceba++){this['d'][this['m']+_0x56ceba]=_0x4fcc15+(_0x261965-_0x4fcc15)*_0x56ceba/_0x28dcc1;}this['m']+=_0x28dcc1;this['d'][this['m']]=_0x261965;}else if(_0x8ab4d9==0x1){_0x261965=QJ['LL']['hexToRgb'](_0x49c560[0x1]);_0x4fcc15=QJ['LL']['hexToRgb'](this['d'][this['m']]);for(let _0x3ee5f8=0x1;_0x3ee5f8<=_0x28dcc1;_0x3ee5f8++){this['d'][this['m']+_0x3ee5f8]=QJ['LL']['rgbToHex']({'r':Math['floor'](_0x4fcc15['r']+(_0x261965['r']-_0x4fcc15['r'])*_0x3ee5f8/_0x28dcc1),'g':Math['floor'](_0x4fcc15['g']+(_0x261965['g']-_0x4fcc15['g'])*_0x3ee5f8/_0x28dcc1),'b':Math['floor'](_0x4fcc15['b']+(_0x261965['b']-_0x4fcc15['b'])*_0x3ee5f8/_0x28dcc1)});}this['m']+=_0x28dcc1;this['d'][this['m']]=_0x49c560[0x1];}else if(_0x8ab4d9==0x2){_0x261965=Number(_0x49c560[0x1])*Math['PI']/0xb4;_0x4fcc15=this['d'][this['m']];for(let _0x16c9c9=0x1;_0x16c9c9<=_0x28dcc1;_0x16c9c9++){this['d'][this['m']+_0x16c9c9]=_0x4fcc15+(_0x261965-_0x4fcc15)*_0x16c9c9/_0x28dcc1;}this['m']+=_0x28dcc1;this['d'][this['m']]=_0x261965;}}else if(_0x13659c[_0x45743b]['includes']('%')){_0x49c560=_0x13659c[_0x45743b]['split']('%');_0x28dcc1=Number(_0x49c560[0x0]);if(_0x8ab4d9==0x0){_0x261965=Number(_0x49c560[0x1]);_0x4fcc15=this['d'][this['m']];for(let _0x4eaa67=0x1;_0x4eaa67<=_0x28dcc1;_0x4eaa67++){this['d'][this['m']+_0x4eaa67]=_0x261965-(_0x261965-_0x4fcc15)*Math['sqrt'](0x1-Math['pow'](_0x4eaa67/_0x28dcc1,0x2));}this['m']+=_0x28dcc1;this['d'][this['m']]=_0x261965;}else if(_0x8ab4d9==0x1){_0x261965=QJ['LL']['hexToRgb'](_0x49c560[0x1]);_0x4fcc15=QJ['LL']['hexToRgb'](this['d'][this['m']]);for(let _0x42833a=0x1,_0xdea4f6;_0x42833a<=_0x28dcc1;_0x42833a++){_0xdea4f6=Math['sqrt'](0x1-Math['pow'](_0x42833a/_0x28dcc1,0x2));this['d'][this['m']+_0x42833a]=QJ['LL']['rgbToHex']({'r':Math['floor'](_0x261965['r']-(_0x261965['r']-_0x4fcc15['r'])*_0xdea4f6),'g':Math['floor'](_0x261965['g']-(_0x261965['g']-_0x4fcc15['g'])*_0xdea4f6),'b':Math['floor'](_0x261965['b']-(_0x261965['b']-_0x4fcc15['b'])*_0xdea4f6)});}this['m']+=_0x28dcc1;this['d'][this['m']]=_0x49c560[0x1];}else if(_0x8ab4d9==0x2){_0x261965=Number(_0x49c560[0x1])*Math['PI']/0xb4;_0x4fcc15=this['d'][this['m']];for(let _0x1d5a81=0x1;_0x1d5a81<=_0x28dcc1;_0x1d5a81++){this['d'][this['m']+_0x1d5a81]=_0x261965-(_0x261965-_0x4fcc15)*Math['sqrt'](0x1-Math['pow'](_0x1d5a81/_0x28dcc1,0x2));}this['m']+=_0x28dcc1;this['d'][this['m']]=_0x261965;}}}}else{this['isMode']=![];let _0x14979b;if(_0x8ab4d9==0x0)_0x14979b=Number(_0x4287b4);else if(_0x8ab4d9==0x1)_0x14979b=_0x4287b4;else if(_0x8ab4d9==0x2)_0x14979b=Number(_0x4287b4)*Math['PI']/0xb4;this['d'][this['m']]=_0x14979b;}};QJFrameLight['prototype']['get']=function(){if(this['t']>this['m'])this['t']=0x0;if(this['d'][this['t']]!=undefined)this['rt']=this['t'];this['t']++;return this['d'][this['rt']];};QJFrameLight['prototype']['getOnly']=function(){return this['d'][this['rt']];};QJFrameLight['prototype']['getTar']=function(_0x20aab2){return this['d'][_0x20aab2>this['m']?0x0:_0x20aab2];};ImageManager['loadLightQJLL']=function(_0x3613b3,_0x25ccb8){let _0x4f79b2=this['loadBitmap']('img/lights/',_0x3613b3,0x0,![]);_0x4f79b2['_name']=_0x3613b3;return _0x4f79b2;};})();
//==========================================================
//
//==========================================================