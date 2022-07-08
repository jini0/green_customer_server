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

// 💚수정하기
// UPDATE 테이블이름 
// SET 필드이름1=데이터값1, 필드이름2=데이터값2, ...
// WHERE 필드이름=데이터값




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