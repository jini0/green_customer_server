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
app.get('/customer/:no', async (req, res)=> {
    const params = req.params;
    console.log(params.no);
    connection.query(
        `select * from customers_table where no=${params.no}`,
        (err, rows, fields)=>{
            res.send(rows);
            // console.log(fields);
            console.log(err);
        }
    )
})

// 💚고객등록 - 등록하기 post전송
app.post('/customers', (req, res)=>{
    const body = req.body;
    const { c_name, c_phone, c_birth, c_gender, c_add, c_adddetail } = body;
    if(!c_name || !c_phone || !c_birth || !c_gender || !c_add || !c_adddetail) {
        res.send("모든 필드를 입력해주세요.");
    }
    connection.query(
        `insert into customers_table('name','phone','birth','gender','add1','add2') values('${c_name}','${c_phone}','${c_birth}','${c_gender}','${c_add}','${c_adddetail}')`,
        (err, rows, fields)=>{
            res.send(rows);
            // console.log(fields);
            console.log(err);
        }
    )
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