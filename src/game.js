/**@type{import("../defs/phaser")} */
let width=220
let height=110
let game=new Phaser.Game({
    type:Phaser.AUTO,
    width:width,
    height:height,
    physics:{
        default:'arcade',
        arcade:{
            // debug:true
        }
    },
    scene:{
        preload:preload,
        create:create,
        update:update
    },
    render:{
        pixelArt:true
    }
})
// 载入资源
function preload(){
    // 载入图片资源
    this.load.image('bg','assets/bg.png')
    this.load.image('wall','assets/wall.png')
    this.load.image('ground','assets/ground.png')
    this.load.image('ball','assets/ball.png')
    this.load.image('panel1','assets/panel1.png')
    this.load.image('panel2','assets/panel2.png')
    this.load.image('num1','assets/num1.png')
    this.load.image('num2','assets/num2.png')
    this.load.image('score','assets/score.png')
    this.load.image('winner1','assets/winner1.png')
    this.load.image('winner2','assets/winner2.png')
    this.load.image('start','assets/start.png')
    this.load.image('title','assets/title.png')
    // 载入序列帧
    this.load.spritesheet('player','assets/sheet_player.png',{
        frameWidth:31,
        frameHeight:19
    })
    this.load.spritesheet('down','assets/effect_down.png',{
        frameWidth:40,
        frameHeight:7
    })
    // 载入音效
    this.load.audio('jump','assets/jump.wav')
    this.load.audio('body','assets/body.wav')
    this.load.audio('ground','assets/ground.wav')
    this.load.audio('click','assets/click.wav')
}
// 初始化游戏
function create(){    
    if(!is_init){
        this.add.image(width/2,height/2,'bg')
        this.add.image(width/2-30,height/2,'title')
        add_tween.call(this,this.add.image(width/2+40,height/2+5,'start').setScale(1.1))
        return
    }
    // 添加背景
    this.add.image(width/2,height/2,'bg')
    wall=this.physics.add.staticSprite(width/2,0,'wall')
    wall.tag="wall"
    wall.setY(height-wall.height+10)
    wall.refreshBody()
    ground=this.physics.add.staticSprite(width/2,0,'ground').setY(height+7)
    ground.setY(height-ground.height)
    ground.refreshBody()
    // 添加UI
    this.add.image(50,20,'panel1')
    this.add.image(width-50,20,'panel2')
    // 游戏相关变量
    is_end_round=false
    is_end_game=false
    score1=0
    score2=0
    index_winner=0
    // 添加角色和球
    speed=10
    jump=150
    g_player=800
    b_player=0.2
    f_player=0.5
    player1=this.physics.add.sprite(50,80,'player')
    player1.tag="p1"
    player1.body.setCircle(10,3)
    player1.setBounce(b_player)
    player1.setGravityY(g_player)
    player1.setFrictionX(f_player)
    player1.setCollideWorldBounds(true)
    dir1=1
    num1=this.add.image(0,0,'num1')
    bind(num1,player1,-5,0)

    player2=this.physics.add.sprite(width-50,80,'player')
    player2.tag="p2"
    player2.setCircle(10,7)
    player2.setBounce(b_player)
    player2.setFrictionX(f_player)
    player2.setGravityY(g_player)
    player2.setFlipX(player2.width/2)
    player2.setCollideWorldBounds(true)
    dir2=-1
    num2=this.add.image(0,0,'num2')
    bind(num2,player2,5,0)

    y_ball=30
    g_ball=300
    b_ball=0.8
    ball=this.physics.add.sprite(width/2,y_ball,'ball')
    ball.body.setCircle(7)
    ball.setBounce(b_ball)
    ball.setCollideWorldBounds(true)

    this.time.addEvent({
        delay:1000,
        callback:fire_ball
    })
    // 添加碰撞
    this.physics.add.collider(player1,ground,function(){is_jump1=false},null,this)
    this.physics.add.collider(player2,ground,function(){is_jump2=false},null,this)
    this.physics.add.collider(player1,ball,bounce_ball.bind(this),null,this)
    this.physics.add.collider(player2,ball,bounce_ball.bind(this),null,this)
    this.physics.add.collider(wall,ball,bounce_ball.bind(this),null,this)
    this.physics.add.collider(ground,ball,touch_ground.bind(this),null,this)
    // 按键控制
    keys=this.input.keyboard.addKeys("W,S,UP,DOWN,SPACE")
    is_jump1=false
    is_jump2=false

    // 添加动画
    this.anims.create({
        key:'idle',
        frames:this.anims.generateFrameNumbers('player',{start:0,end:3}),
        frameRate:5,
        repeat:-1      
    })
    this.anims.create({
        key:'run',
        frames:this.anims.generateFrameNumbers('player',{start:4,end:7}),
        frameRate:10,
        repeat:-1
    })
    this.anims.create({
        key:'jump',
        frames:this.anims.generateFrameNumbers('player',{start:8,end:15}),
        frameRate:10,
        repeat:-1
    })
    this.anims.create({
        key:'down',
        frames:this.anims.generateFrameNumbers('down',{start:0,end:4}),
        frameRate:15,
    })
}
function update(){ 
    if(!is_init){
        this.input.on('pointerdown',()=>{
            is_init=true
            this.load.audio('ground','assets/ground.wav')
            restart_game.bind(this)()
        })
        return
    }
    update_bind()
    // 重新开始
    if(keys.SPACE.isDown){
        restart_game.bind(this)()  
    }
    if(is_end_round||is_end_game)return
    // 玩家一控制
    if(keys.S.isDown){
        player1.setVelocityX(dir1*100)
        player1.anims.play('run',true)
        if((player1.x<20&&dir1==-1)||(player1.x>90&&dir1==1))dir1*=-1
    }else if(keys.W.isDown&&!is_jump1){        
        is_jump1=true
        player1.setVelocityY(-jump)
        show_down.bind(this)(player1.x,player1.y+8)
        this.sound.play('jump')
    }else{
        player1.anims.play('idle',true)
        player1.setVelocityX(0)
    }
    // 玩家二控制
    if(keys.DOWN.isDown){
        player2.setVelocityX(dir2*100)
        player2.anims.play('run',true)
        if((player2.x<130&&dir2==-1)||(player2.x>200&&dir2==1))dir2*=-1
    }else if(keys.UP.isDown&&!is_jump2){
        is_jump2=true
        player2.setVelocityY(-jump)
        show_down.bind(this)(player2.x,player2.y+8)
        this.sound.play('jump')
    }else{
        player2.anims.play('idle',true)
        player2.setVelocityX(0)
    }
    
} 
// 自定义函数：绑定位置
function bind(obj1,obj2,posx,posy){
    arr_to_bind.push({
        obj1:obj1,
        obj2:obj2,
        posx:posx,
        posy:posy
    })
}
var arr_to_bind=[]
function update_bind(){
    for(let i=0;i<arr_to_bind.length;i++){
        let to_bind=arr_to_bind[i]
        let obj1=to_bind.obj1
        let obj2=to_bind.obj2
        let posx=to_bind.posx
        let posy=to_bind.posy
        obj1.setX(obj2.x+posx)
        obj1.setY(obj2.y+posy)
    }    
}
function bounce_ball(obj){
    if(is_end_round)return
    let tag=obj.tag
    let vely=0
    if(tag=="p1"||tag=="p2"){
        this.sound.play('body')
        if(tag=="p1"){
            ball.setVelocityX(50+Phaser.Math.Between(0,50))
        }else{
            ball.setVelocityX(-50-Phaser.Math.Between(0,50))
        }
        vely=Phaser.Math.Between(0,100)+100
    }else if(tag=="wall"){
        vely=Phaser.Math.Between(0,50)+50        
    }
    ball.setVelocityY(-vely)
}
function touch_ground(){
    if(is_end_round)return
    this.sound.play('ground')
    let posx=ball.x
    if(posx<width/2){        
        add_score.bind(this)(2)
        this.time.addEvent({
            delay:2000,
            callback:restart_round.bind(this)
        })
    }else{
        add_score.bind(this)(1)
        this.time.addEvent({
            delay:2000,
            callback:restart_round.bind(this)
        })
    }
    player1.setVelocityX(0)
    player2.setVelocityX(0)
    ball.setVelocityX(0)
    ball.setVelocityY(0)
    is_end_round=true
}
function restart_round(){
    if(is_end_game)return
    player1.setX(50)
    player1.setY(80)
    player2.setX(width-50)
    player2.setY(80)
    dir1=1
    dir2=-1
    ball.setX(width/2)
    ball.setY(y_ball)
    ball.setVelocityX(0)
    ball.setVelocityY(0)
    ball.setGravityY(0)
    this.time.addEvent({
        delay:1500,
        callback:fire_ball
    })
    is_end_round=false
}
function fire_ball(){
    if(is_end_game)return
    let dir=Phaser.Math.Between(0,1)*2-1
    let vel=Phaser.Math.Between(0,40)+80
    ball.setVelocityX(dir*vel)
    ball.setGravityY(g_ball)
}
function add_score(player,index){
    if(player==1){
        this.add.image(rootx1+depth*score1,rooty,'score')
        score1++
    }else if(player==2){
        this.add.image(rootx2+depth*score2,rooty,'score')        
        score2++
    }
    if(score1>=dest_win||score2>=dest_win){
        if(score1>score2)index_winner=1
        else index_winner=2
        end_game.bind(this)()
    }
}
function end_game(){
    is_end_game=true
    let winner;
    if(index_winner==1)winner=this.add.image(50,50,'winner1')
    else winner=this.add.image(width-50,50,'winner2')
    let start=this.add.image(width/2,43,'start')    
    as_button(start,restart_game.bind(this))
    add_tween.bind(this)(start)
}
function restart_game(){
    this.sound.play('click')
    this.scene.restart()
}
function as_button(obj,func){
    obj.setInteractive()
    obj.on('pointerdown',func)
}
function add_tween(obj){
    this.tweens.add({
        targets:obj,
        y:obj.y+5,
        duration:1000,
        ease:'Power2',
        yoyo:true,
        loop:-1
    })
}
function show_down(posx,posy){
    console.log("jump")
    let effect=this.add.sprite(posx,posy,'down').play('down',true)
    effect.on('animationcomplete',()=>effect.destroy())
}
const dest_win=5
const rootx1=36
const rootx2=144
const rooty=20
const depth=10
let is_init=false