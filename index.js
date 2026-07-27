const dns = require('dns');
const cors =require('cors');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const User= require("./models/User");
const bcrypt = require("bcrypt");


dotenv.config();

connectDB();

const app = express();
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.get("/",(req , res)=>{
    res.send("hello basem")
})


app.post("/register", async (req, res) => {
try {
    const { fullName, age, email, kind, password } = req.body;

    // التحقق من وجود البيانات المطلوبة
    if (!fullName || !age || !email || !kind || !password) {
    return res.status(400).json({ message: "من فضلك أدخل كل البيانات المطلوبة" });
    }

    // التحقق من عدم تكرار الإيميل
    const existingUser = await User.findOne({ email });
    if (existingUser) {
    return res.status(409).json({ message: "هذا البريد الإلكتروني مستخدم بالفعل" });
    }

    // تشفير الباسورد قبل الحفظ
    const hashedPassword = await bcrypt.hash(password, 10);

    // إنشاء المستخدم بالباسورد المشفّر
    const newUser = new User({
    fullName,
    age,
    email,
    kind,
    password: hashedPassword,
    });

    await newUser.save();

    // الرد بدون إرجاع الباسورد أبدًا
    res.status(201).json({
    message: "تم إنشاء الحساب بنجاح",
    user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        kind: newUser.kind,
    },
    });

} catch (error) {
    console.error(error);
    res.status(500).json({ message: "حدث خطأ في السيرفر" });
}
});

app.post("/login", async (req, res) => {
try {
    const { email, password } = req.body;

    // التحقق من وجود البيانات
    if (!email || !password) {
    return res.status(400).json({ message: "من فضلك أدخل البريد الإلكتروني وكلمة المرور" });
    }

    // البحث عن المستخدم بالإيميل مباشرة (بدل ما تجيب كل اليوزرز وتعمل loop)
    const user = await User.findOne({ email });

    if (!user) {
    return res.status(404).json({ message:"الايميل او كلمة السر خطا" });
    }

    // مقارنة الباسورد المدخل بالـ hash المخزن في الداتابيز
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
    return res.status(401).json({ message:"الايميل او كلمة السر خطا" });
    }

    // تسجيل الدخول ناجح
    res.status(200).json({
    message: "تم تسجيل الدخول بنجاح",
    user: {
        id: user._id,
        name: user.name,
        email: user.email,
    },
    });

} catch (error) {
    console.error(error);
    res.status(500).json({ message: "حدث خطأ في السيرفر" });
}
});

app.get("/alldata",async (req,res)=>{
    const users = await User.find()
    res.status(201).json(users)
})
app.listen(process.env.PORT,() => {
console.log(`Server running on http://localhost:${process.env.PORT}`);
});