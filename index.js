// 🖤서버 만들기 - 다 똑같음! (+ database만 mysql설치해서 쓸거임)
//1. npm init   - package.json이 생성됨
//2. npm install express
//3. npm install cors     하고 나서 index.js 파일을 만들어줌
const express = require("express");         //express로 만들거니까!
const cors = require("cors");
const app = express();
const port = 3001;
const mysql = require("mysql");
const fs = require("fs");           //파일을 읽어오도록 만들어주는 애
// 💕8.3 - 2개 추가
const bcrypt = require('bcrypt');   //비밀번호 암호화       //6. npm install bcrypt
const saltRounds = 10;              //10번 암호화 할거다!(기회)
// 🧡8.5 이미지게시판🧡
app.use(express.static("public"));
const multer  = require('multer');

const dbinfo = fs.readFileSync('./database.json');
//받아온 json데이터를 객체형태로 변경 JSON.parse
const conf = JSON.parse(dbinfo);

// 💛connection💛
// connection mysql연결 : createConnection()으로 만들어줌!
// connection.connect() 연결하기
// connection.end() 연결종료
// connection.query('쿼리문', callback함수 ) 
                            //callback(error, result, result의 field정보)
//연결고리(선)를 만들어줘!
const connection = mysql.createConnection({
    host:conf.host,             
    user:conf.user,                                                               
    password:conf.password,                                                      
    port:conf.port,                                                               
    database:conf.database                                                       
    //  --MySQL Workbench와 AWS RDS 연결하고 나서, 그때 연결할 aws의 엔드포인트와 마스터이름/암호 그리고 새로 만든 'customer' 라는 connectiond에서 만든 데이터베이스들 넣어주기!
    //  --서버 부분 구동이 완료 되었다면 이제 클라이언트와 서버를 연결 해준다.--
    // ✔이 항목들을 database.json에 담아주고! --> 불러오게 한거임!!✔
    // host:"customer-data.cdtmdsnqpirx.us-east-1.rds.amazonaws.com",              //aws(아마존웹서비스) 새로만든 데이터베이스의 엔드포인트!! (Hostname)
    // user:"admin",                                                               //마스터 username
    // password:"rornfl3693",                                                      //마스터 암호
    // port:"3306",                                                                //port번호
    // database:"customers"                                                        //workbench에서 local 말고, 새로 만든 customer라는 연결선?(connection name)에서 customers라는 schemes를 만듬!(데이터베이스이름)
})
app.use(express.json());
app.use(cors());
// 🧡8.5
app.use("/upload", express.static("upload"));

// 🧡8.5
// 파일 요청시 파일이 저장될 경로와 파일이름(요청된 원본파일이름) 지정
const storage = multer.diskStorage({
    destination: "./upload/",
    filename: function(req, file, cb){
        cb(null, file.originalname);
    }
})

// 업로드 객체
const upload = multer({
    storage: storage,
    limits: { fieldSize: 1000000 }
})

// upload경로로 포스트 요청이 왔을 때 응답
app.post("/upload", upload.single("img"), function(req, res, next){
    res.send({
        imageUrl: req.file.filename
    });
})
//postman에 테스트 POST http://localhost:3001/upload 하고
// Body - form-data 
// 글자적는 란에, img  적고 text가 아니라   file로 변경  --> file선택란에서 아무 이미지 클릭해서 넣고 send하면,
// 밑에창에
// {
//     "imageUrl": "img"                //req.file.filename --> filename이 나오는거임!  
// }
// 로 잘 들어가지고 server의 upload폴더에 이미지들이 잘 들어감 



// app.get("경로", 함수)
// connection.query("쿼리문", 함수)
// 💚get방식 - customerlist 에 항목들 뜨게하기 
app.get('/customers', async (req, res)=> {
    //connection 해주기
    // connection.connect();
    connection.query(
        "select * from customers_table",
        (err, rows, fields)=>{          // 위에 쿼리가 실행되면 이 함수들이 실행됨!   / err : 에러발생 
            res.send(rows);
            console.log(fields);
        }
    )
    // res.send("고객정보입니다.")
    //connection.end();                 //connection.end() 때문에 자꾸 서버 연결이 끊김 ..-> 없애주기!!!
})
// 내가 한거
// 💚get방식 - /customers/1  이렇게 url 요청했을 때도 나오게!!(각 no(여기선 id로 안주고 no로 줬었음(table의 autokey값))에 해당하는 값들이 나오게!)
// app.get('/detailview/:no', async (req, res)=> {
                     // :(콜론)  --> 파라미터로 받겠다 의미!!!   --> 콜론이 붙어있어야지 얘 안에 얘를 저장시킬  수 있음!!!
                    // ex> localhost:3001/customer/1  --> 1의 값은 req이 요청으로 가지고있고 res가 보내는거..?
app.get('/customer/:no', async (req, res)=> {
    const params = req.params;          // 객체형태의 값을 가지고 있음!!  { no: 1, name: ~~ }의 값을 params가 가지고 있음 --> 객체니까 no가 key가 될거임!! --> 숫자1에 접근가능 
    console.log(params.no);
    connection.query(
        `select * from customers_table where no = ${params.no}`,            // 전체결과 조회아니고 하나만 조회할거임 --> where절! 
        (err, rows, fields)=>{
            console.log(rows);                  //rows 찍어주면 --> 터미널에 보면 얘는 배열로 받음!!!       --> rows[0] 배열의 값을 받아올때는 index를 해줘야함!!!!
            res.send(rows);                     
            // res.send(rows[0]);               //✔선생님하신거 : 이렇게 바로 배열의 0번째 값을 불러오게 할 수도 있음!! --> 나는 여기엔 그냥 rows주고 client에서 customer[0].name이라고 하나하나 담아줬음!
                                                //배열의 0번째 값은 객체니까 -> 객체로 가겠다 의미!!!
            // console.log(fields);             
            console.log(err);
        }
    )
})
// 내가 한거
// 💚고객등록 - 등록하기 post전송
// app.post('/customers', (req, res)=>{
//     const body = req.body;
//     const { c_name, c_phone, c_birth, c_gender, c_add, c_adddetail } = body;
//     if(!c_name || !c_phone || !c_birth || !c_gender || !c_add || !c_adddetail) {
//         res.send("모든 필드를 입력해주세요.");
//     }
//     connection.query(
//         `insert into customers_table('name','phone','birth','gender','add1','add2') values('${c_name}','${c_phone}','${c_birth}','${c_gender}','${c_add}','${c_adddetail}')`,
//         (err, rows, fields)=>{
//             res.send(rows);
//             // console.log(fields);
//             console.log(err);
//         }
//     )
// })
// 선생님이랑 - 고객등록
// * addCustomer post요청이 오면 처리 
// 첫번째 매개변수 req => 요청하는 객체, 두번째 매개변수 res => 응답하는 객체
// 이름을 꼭 req res로 안해도 되고 ab/bd/ 등 아무렇게나 지정해도 받는 값이 '요청' '응답' 인거!!!
// const [ formData, setFormData ] = useState의 인풋값들의 key값들을 body에 받아줘야함!  --> 이름대로 넣어줘야함!!!
// c_name: "",
// c_phone: "",
// c_birth: "",
// c_gender: "",
// c_add: "",
// c_adddetail: ""
app.post("/addCustomer", async (req, res)=>{
    const { c_name, c_phone, c_birth, c_gender, c_add, c_adddetail } = req.body;
    // ✨connection.query("쿼리", (err, result, fields )=>{})         / 함수자리는 callback함수라서 function 넣어서 해줘도 되고 화살표함수도 가능  ==> 여기있는 콜백함수는 "쿼리문"이 실행되면 호출되는거임!
                                //인자 이름은 상관 없음 a라 해도 됨 b라고 해도됨!                                   
                                //호출될 때 인자로 첫번째엔 error를 담아줌(에러가 발생시) / 두번째는 result(결과가 담김) / 세번째는 fields(result의 fields값이 담김)
    // mysql 쿼리문 select / update / delete / insert 정도는 암기하자!
    // cf. insert문 :insert into 테이블(컬럼1, 컬럼2, 컬럼3,....) values("값1","값2","값3")
    // "쿼리" :insert into 테이블(컬럼1, 컬럼2, 컬럼3,....) values(?,?,?)
    // query("쿼리",[값1,값2,값3,값4,값5,값6], 함수)  --> 값들을 배열로 적을거!!!!!!  --> values의 값들을 ?로 해주면 여기 쿼리의 값에 ?가 담김 / 여기 "쿼리"에 위의 쿼리가 담기는거!
    //  ==> insert into customers_table(name, phone, birth, gender, add1, add2) values(?,?,?,?,?,?)
    // 😶?????를 해주는 거는 쿼리문을 한줄에 다 안적으면 빨간줄이 생기는데 values(?,?,?,?,?,?) 이렇게 하고 밑에 []값들을 적어줘서 두 줄로 적게해주는거!!!  --> 보기편하게 하기위해서😶
    connection.query("insert into customers_table(name, phone, birth, gender, add1, add2) values(?,?,?,?,?,?)", 
        [c_name, c_phone, c_birth, c_gender, c_add, c_adddetail] ,
        (err, result, fields )=>{
            console.log(result);
            res.send("등록 되었습니다.");
    })
    // ---> 테스트해보기 - postman 들어가보기
    // 값을 이렇게 넣어줌
    // {
    //     "c_name": "그린",
    //     "c_phone": "010-1234-5678",
    //     "c_birth": "20100203",
    //     "c_gender": "남성",
    //     "c_add": "부산 금정구 부곡동",
    //     "c_adddetail": "ㅇㅇㅇㅇㅇ"
    // }
    // 등록 되었습니다. 라고 밑에 뜸!    --> 잘 담겼는지 workbench열어서 확인해보기!!!
    // table에 잘 담겨있는거 확인할 수 있음!!!!! ---> 이제 client에서도 신규고객등록 클릭해서 해보기!!

    // <설명>
    // 3.
    // const { name, age } = req.body;
    // console.log(name);
    // console.log(age);
    // res.send(req.body);
    // 터미널에
    // PS D:\01-STUDY\react\green_customer_server> node index.js 고객 서버가 돌아가고 있습니다.
    // abc              // 이렇게 이제는 객체가 아니고 값이 나옴!
    // 30
    //body.name이라 안불러도 되고 name아! 라고 부를 수 있음!!

    // 1.
    // console.log(req);
    //postman으로 post요청 보내보기!!!  --> post요청 주소: http://localhost:3001/addCustomer 적어줌
    //body - raw - JSON 데이터 형식 - 
    // {
    //     "name":"abc",
    //     "age":30
    // }
    // 라고 치고 send 보내기!  ---> req만 적어주면 요청이 안됨 ! --> send 실패
    //터미널에 보면   body: { name: 'abc', age: 30 }, 라고 적힘!
    // 2. 다 body에 담김!!      ---> req.body에 적어줘야 전송이됨!
    // console.log(req.body);
    // res.send(req.body);
    //다시 postman 열어서 보낸걸 다시 send하면 밑에 창에 보내졌다고 뜸  -- 밑에 창에도 이렇게 뜸
    // {
    //     "name": "abc",
    //     "age": 30
    // }
    //그리고 터미널에도 PS D:\01-STUDY\react\green_customer_server> node index.js  고객 서버가 돌아가고 있습니다. 
    // { name: 'abc', age: 30 } 잘 찍힘!  --> 그치만 객체형태로 받음
})

// 💚삭제요청시 처리 /delCustomer/${no}
// delete문 : delete from 테이블명 조건절
// delete from customers_table where no = no            / no가 고정된 값이 아니라 -> params의 no!
app.delete('/delCustomer/:no', async (req, res) => {
                        //요청때는 세미콜론 찍음안됨!! 달러표시 안됨!!!!!✨
    const params = req.params;
    console.log("삭제");
    connection.query(
        `delete from customers_table where no = ${params.no}`, 
        (err, rows, fields)=>{
            res.send(rows);
        })    
})

// 💚수정하기 - put전송방식
// // - 내가 한거
// // UPDATE 테이블이름 
// // SET 필드이름1=데이터값1, 필드이름2=데이터값2, ...
// // WHERE 필드이름=데이터값
// // http://localhost:3001/updateCustomer/${no}
// // 쿼리문 update문 : update customers_table set name='${c_name}',phone='${c_phone}',birth='${c_birth}',gender='${c_gender}',add1='${c_add}',add2='${c_adddetail}'
// //                  where no = '${params.no}'
// app.put('/updateCustomer/:no', async (req, res)=>{
//     const params = req.params;
//     const { c_name, c_phone, c_birth, c_gender, c_add, c_adddetail } = req.body;
//     connection.query(
//         `update customers_table set name='${c_name}',phone='${c_phone}',birth='${c_birth}',gender='${c_gender}',add1='${c_add}',add2='${c_adddetail}' where no='${params.no}'`,
//         (err, rows,fields)=>{
//             res.send(rows);
//             console.log(err);
//         })
// })
// - 선생님이랑   ✨update는 put으로 받음✨
// workbench로 테이블이름, 컬럼명 잘 보고 작성해주기!
// update 테이블이름 set 컬럼명 = 값 where no = 값
// update customers_table set name='', phone='', birth='',gender='',add1='',add2='' where no =
// http://localhost:3001/editcustomer/1 이라고 요청하면, 주소창의 1이라는 걸 전달하기 위한 것 -> 파라미터!!!!
app.put('/editcustomer/:no', async (req, res)=>{
    // 얘 자체가 no가 아니고 params 객체
    // 파라미터 값을 가지고 있는 객체 : params
    const params = req.params;
    // params.no 하면 저 1에 접근할 수 있음
    //put 요청을 할 때 이 값들을 다 가지고 올거임(body안에)  --> 구조분해할당으로 가져온거
    const { c_name, c_phone, c_birth, c_gender, c_add, c_adddetail } = req.body;
    connection.query(`update customers_table set name='${c_name}', phone='${c_phone}', birth='${c_birth}',gender='${c_gender}',add1='${c_add}',add2='${c_adddetail}' where no=${params.no}`,
                                                                                                                                                                        //no는 숫자라서 '따옴표'
    (err,result,fields)=>{
        res.send(result);
    })
})
//하고 나서 테스트하려고 postman으로 해보기!!!!(서버가 잘되었는지 포스트맨으로)


// 💕8.3 회원가입 요청
app.post("/join", async (req, res)=>{
    let myPlanintextPass = req.body.userpass;       //body에 userpass라는 애가 있으면 담아줘!
    let myPass = "";        //password를 green1234로 했음  -->  req.body.userpass가 담아둘거임  --> 얘를 암호화 할거임 --> 암호화한 애를 담아주기 위해 myPass 빈변수를 만들어줌
    if(myPlanintextPass != '' && myPlanintextPass != undefined){
        //빈 값과 undefined가 아닐때,
        //1. 💗https://www.npmjs.com/package/bcrypt 에서 긁어오고 변수만 제대로 고쳐주기!!!!(Technique 1 (generate a salt and hash on separate function calls): 꺼 긁어와서)💗
        bcrypt.genSalt(saltRounds, function(err, salt) {
            bcrypt.hash(myPlanintextPass, salt, function(err, hash) {
                // Store hash in your password DB.
                myPass = hash;
                console.log(myPass);

                //2. 쿼리 작성
                const {username, userphone, userorg, usermail} = req.body;
                //connection.query(쿼리문, 쿼리문에 들어갈 값, 콜백함수)   -->쿼리문인자, 배열, 콜백함수                                      //regdate등록일만 바로 넣어줄거임  --> now()함수 사용하고 DATE_FORMAT을 이용해서 년/월/일만 나오게(시간은 빼고!):'%Y-%m-%d'
                connection.query("insert into customer_members(username, userpass, userphone, userorg, usermail, regdate) values(?,?,?,?,?,DATE_FORMAT(now(),'%Y-%m-%d'))",
                [username, myPass, userphone, userorg, usermail],
                (err, result, fields) => {
                    console.log(result)
                    console.log(err)
                    res.send("등록되었습니다.")
                }
                )
            });
        });
    }
})
//1. 적고나서, postman 열어서 테스트해보기  --> POST    http://localhost:3001/join 주소 입력
//Body - row에서 
//{
//     "userpass":"sky1"
// }
//이렇게 입력해줌 node index.js로 서버 돌려주고, 위의 값을 포스트맨에서 send 해주면
//터미널에 $2b$10$odSk9w2XScqFf80JSBMgBuSidIPx6txsi7xdPlelYUMdMr4Y/Yo/2   이런식으로 뜬다  --> sky1이 암호화된거!
//2. 적고나서, postman으로 테스트  (위에와 주소랑 Body-row는 같음)
// {
//     "username":"green",
//     "userpass":"sky1",
//     "userphone":"01012341234",
//     "usermail":"abc@nacer.com",
//     "userorg":"그린"
// }            //등록일은 바로 지정해줘서 이렇게 5개만 배열에 들어갈 5개만 넣어주기
//send보내면, 밑에 등록되었습니다. 가 뜨고 / mysql workbench에서 customer_members table에서 값들이 잘 추가입력된 걸 볼 수 있다!

// 💕8.3 로그인 요청
app.post('/login', async (req, res)=> {
    // - 2개만 받아올거임 id인 usermail과 비밀번호인 userpass
    // ✔usermail값에 일치하는 데이터가 있는지 select문 1234 -> #dfwew2rE 이런식으로 이상하게 암호화돼서
    //   입력한 userpass를 암호화 해서 쿼리 결과의 패스워드와 일치하는지를 체크
    // - 사용자가 회원가입시 1111로 비밀번호를 가입했는데 mysql에 값이 담길 때는 암호화되어서 $2b$10$wzNRbu9ndmQnw2CZ5H2HFuD.vMDLqnRAmrpE2sUo7SQFHPOf2TKn6 이런식으로 담기니까
    //   사용자가 로그인시, 입력한 비밀번호인 1111을 다시 암호화하고 mysql에 담긴 암호화된 비밀번호와 두개가 일치하는지 비교하게 할거임!!!
    const {usermail, userpass} = req.body;
    connection.query(`select * from customer_members where usermail = '${usermail}'`,
    (err, rows, fields)=>{
        if(rows != undefined){      //결과가 있을 때
            if(rows[0] == undefined){
                // res.send(null)
                res.send("실패")
            }else {
                //https://www.npmjs.com/package/bcrypt 에서 긁어오기 (To check a password: 여기서!!! 맨 위의 주석빼고 위에 두줄만 적어주기)
                bcrypt.compare(userpass, rows[0].userpass, function(err, result) {
                                        //rows[0].userpass : hash자리  --> 암호화한 비번
                    // result == true
                    if(result == true){
                        res.send(rows[0])
                    }else {
                        // res.send(null)       //null받으면 체크해야하니까..?실패가 뜨게하자
                        res.send("실패")
                    }
                });

            }
        }else {                     //결과가 없을 때
            res.send(null)
        }
    })
})
// postman으로 테스트 POST - http://localhost/3001에서 Body - row에서,
// customer_members 테이블에 가입한 애! 넣어주기 --> 나는 username이 '무미'인 아이디 메일과 비밀번호를 넣어주고 send하면
// {
//     "usermail":"mmm@naver.com",
//     "userpass":"1111"
// }
//밑에 창에,
// {
//     "username": "무미",
//     "userpass": "$2b$10$wzNRbu9ndmQnw2CZ5H2HFuD.vMDLqnRAmrpE2sUo7SQFHPOf2TKn6",          //비밀번호는 암호화되니까 비번 기억해두기! (1111)
//     "userphone": "01012341234",
//     "usermail": "mmm@naver.com",
//     "regdate": "2022-08-03",
//     "userorg": "서울"
// }                        //이렇게 내가 회원가입했던 column과 값들이 뜰거임!

// 🧡8.5 
// gallery 포스트 요청시 처리해줄 insert문
app.post("/gallery", async (req, res) => {
    const { usermail, title, imgurl, desc } = req.body;
    connection.query("insert into customer_gallery(`title`,`imgurl`,`desc`,`usermail`) values(?,?,?,?)",
    [title, imgurl, desc, usermail] ,
    (err, result, fields)=>{
        res.send("등록되었습니다.")
        console.log(err);
    })
})
// gallery 겟 요청시
app.get("/gallery", async (req, res) => {
    connection.query("select * from customer_gallery", 
    (err, result, fields)=>{
        res.send(result)        //결과를 넘겨줘!
    })
})


// 🖤서버실행
app.listen(port, ()=>{
    console.log("고객 서버가 돌아가고 있습니다.")
})
// 하고 4. node index.js 해주면 '고객 서버가 돌아가고 있습니다' 라고 터미널에 뜸!
// 크롬에서 localhost:3001/customers 해주면 -> 고객정보입니다. 가 뜸!
//5. npm install mysql



// 💛connection 하고 나서, node index.js 실행한 다음 localhost:3001/customers가 열리면, 새로고침하고 --> 터미널에 fields가 찍힘!!!!
// [
//     FieldPacket {
//       catalog: 'def',
//       db: 'customers',
//       table: 'customers_table',
//       orgTable: 'customers_table',
//       name: 'no',
//       orgName: 'no',
//       charsetNr: 63,
//       length: 11,
//       type: 3,
//       flags: 16899,
//       decimals: 0,
//       default: undefined,
//       zeroFill: false,
//       protocol41: true
//     },
//     FieldPacket {
//       catalog: 'def',
//       db: 'customers',
//       table: 'customers_table',
//       orgTable: 'customers_table',
//       name: 'name',
//       orgName: 'name',
//       charsetNr: 33,
//       length: 60,
//       type: 253,
//       flags: 4097,
//       decimals: 0,
//       default: undefined,
//       zeroFill: false,
//       protocol41: true
//     },
//     FieldPacket {
//       catalog: 'def',
//       db: 'customers',
//       table: 'customers_table',
//       orgTable: 'customers_table',
//       name: 'phone',
//       orgName: 'phone',
//       charsetNr: 33,
//       length: 36,
//       type: 253,
//       flags: 4097,
//       decimals: 0,
//       default: undefined,
//       zeroFill: false,
//       protocol41: true
//     },
//     FieldPacket {
//       catalog: 'def',
//       db: 'customers',
//       table: 'customers_table',
//       orgTable: 'customers_table',
//       name: 'birth',
//       orgName: 'birth',
//       charsetNr: 33,
//       length: 30,
//       type: 253,
//       flags: 4097,
//       decimals: 0,
//       default: undefined,
//       zeroFill: false,
//       protocol41: true
//     },
//     FieldPacket {
//       catalog: 'def',
//       db: 'customers',
//       table: 'customers_table',
//       orgTable: 'customers_table',
//       name: 'gender',
//       orgName: 'gender',
//       charsetNr: 33,
//       length: 12,
//       type: 253,
//       flags: 4097,
//       decimals: 0,
//       default: undefined,
//       zeroFill: false,
//       protocol41: true
//     },
//     FieldPacket {
//       catalog: 'def',
//       db: 'customers',
//       table: 'customers_table',
//       orgTable: 'customers_table',
//       name: 'add1',
//       orgName: 'add1',
//       charsetNr: 33,
//       length: 300,
//       type: 253,
//       flags: 4097,
//       decimals: 0,
//       default: undefined,
//       zeroFill: false,
//       protocol41: true
//     },
//     FieldPacket {
//       catalog: 'def',
//       db: 'customers',
//       table: 'customers_table',
//       orgTable: 'customers_table',
//       name: 'add2',
//       orgName: 'add2',
//       charsetNr: 33,
//       length: 300,
//       type: 253,
//       flags: 4097,
//       decimals: 0,
//       default: undefined,
//       zeroFill: false,
//       protocol41: true
//     }
//   ]