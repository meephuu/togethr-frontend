import Navbar from "../../components/ui/Navbar";
import Footer from "../../components/ui/Footer";

function Section({ number, title, children }) {
    return (
        <section className="mb-10">
            <h2 className="text-xl font-bold text-text-main mb-3">
                {number}. {title}
            </h2>
            <div className="space-y-3 text-text-muted leading-relaxed">
                {children}
            </div>
        </section>
    );
}

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <div className="max-w-3xl mx-auto px-4 py-16">
                <h1 className="text-3xl font-bold text-text-main mb-2">
                    นโยบายความเป็นส่วนตัว (Privacy Policy)
                </h1>
                <p className="text-lg font-semibold text-text-main mb-1">Togethr</p>
                <p className="text-sm text-text-muted mb-10">
                    เวอร์ชัน 1.0 | มีผลบังคับใช้ตั้งแต่วันที่ [ใส่วันที่เผยแพร่]
                </p>

                <Section number={1} title="บทนำ">
                    <p>
                        &ldquo;Togethr&rdquo; (&ldquo;เรา&rdquo;, &ldquo;แพลตฟอร์ม&rdquo;) ให้ความสำคัญกับความเป็นส่วนตัวของผู้ใช้งานทุกคน
                        ไม่ว่าจะเป็นผู้มองหาเพื่อนเที่ยว (Customer) หรือผู้เชี่ยวชาญในพื้นที่ (Provider) นโยบายฉบับนี้อธิบายว่าเราเก็บรวบรวม
                        ใช้ เปิดเผย และคุ้มครองข้อมูลส่วนบุคคลของท่านอย่างไร ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)
                    </p>
                    <p>
                        การใช้งานแพลตฟอร์มของเรา ถือว่าท่านได้อ่านและตกลงยินยอมตามนโยบายฉบับนี้ ท่านสามารถถอนความยินยอมได้ทุกเมื่อตามที่ระบุในหัวข้อที่ 7
                    </p>
                </Section>

                <Section number={2} title="ข้อมูลที่เราเก็บรวบรวม">
                    <h3 className="font-semibold text-text-main">2.1 ข้อมูลที่ผู้ใช้ทุกคนต้องให้ (User)</h3>
                    <ul className="list-disc list-inside space-y-1">
                        <li>ชื่อ–นามสกุล, ชื่อผู้ใช้ (Username), รหัสผ่าน (จัดเก็บแบบ hashed)</li>
                        <li>เพศ, วันเดือนปีเกิด</li>
                        <li>เบอร์โทรศัพท์</li>
                        <li>ช่องทางติดต่อโซเชียล (Instagram, Line, Facebook) — ไม่บังคับ</li>
                        <li>เลขบัญชีธนาคาร — ไม่บังคับ (ใช้สำหรับธุรกรรมการเงิน)</li>
                    </ul>

                    <h3 className="font-semibold text-text-main pt-3">2.2 ข้อมูลเพิ่มเติมสำหรับผู้ให้บริการ (Provider)</h3>
                    <ul className="list-disc list-inside space-y-1">
                        <li>เลขบัตรประจำตัวประชาชน (สำหรับยืนยันตัวตนและความปลอดภัยของผู้ใช้บริการ)</li>
                        <li>ประวัติโดยย่อ (Bio) และภาษาที่สามารถสื่อสารได้</li>
                        <li>ข้อมูลเบอร์ติดต่อฉุกเฉิน</li>
                    </ul>

                    <h3 className="font-semibold text-text-main pt-3">2.3 ข้อมูลการใช้งานแพลตฟอร์ม</h3>
                    <ul className="list-disc list-inside space-y-1">
                        <li>ประวัติการจอง การชำระเงิน และการยกเลิก/คืนเงิน</li>
                        <li>ข้อความแชทระหว่างคู่สัญญา (Customer และ Provider) หลังจากจองสำเร็จ</li>
                        <li>รีวิวและคะแนนที่ให้/ได้รับ</li>
                        <li>ประวัติการร้องเรียนและการแก้ไขปัญหาผ่านทีม Admin</li>
                    </ul>

                    <h3 className="font-semibold text-text-main pt-3">2.4 ข้อมูลทางเทคนิค</h3>
                    <ul className="list-disc list-inside space-y-1">
                        <li>ที่อยู่ IP, ประเภทอุปกรณ์และเบราว์เซอร์</li>
                        <li>คุกกี้และเทคโนโลยีติดตามที่คล้ายกัน (ดูรายละเอียดในนโยบายคุกกี้แยกต่างหาก)</li>
                    </ul>
                </Section>

                <Section number={3} title="วัตถุประสงค์ในการใช้ข้อมูล">
                    <p>เราใช้ข้อมูลของท่านเพื่อ:</p>
                    <ol className="list-decimal list-inside space-y-1">
                        <li>สร้างและยืนยันตัวตนบัญชีผู้ใช้ (Customer/Provider)</li>
                        <li>จับคู่ผู้ใช้บริการกับผู้ให้บริการตามความสนใจ งบประมาณ และความพร้อม</li>
                        <li>ดำเนินการจอง ประมวลผลการชำระเงิน มัดจำ และการคืนเงินตามนโยบาย</li>
                        <li>เปิดใช้งานระบบแชทระหว่างคู่สัญญา และบันทึกไว้เพื่อการตรวจสอบความปลอดภัยและข้อพิพาท</li>
                        <li>แสดงรีวิวและคะแนนบนโปรไฟล์สาธารณะของผู้ให้บริการ</li>
                        <li>ตรวจสอบและจัดการข้อร้องเรียนผ่านทีม Admin</li>
                        <li>ป้องกันการฉ้อโกง การละเมิด และรักษาความปลอดภัยของแพลตฟอร์ม</li>
                        <li>ปฏิบัติตามกฎหมายและคำสั่งของหน่วยงานราชการที่เกี่ยวข้อง</li>
                    </ol>
                    <p>
                        <span className="font-semibold text-text-main">ฐานทางกฎหมาย:</span> เราประมวลผลข้อมูลของท่านโดยอาศัยความยินยอม
                        ความจำเป็นในการปฏิบัติตามสัญญากับท่าน (บริการจับคู่และการจอง) และประโยชน์โดยชอบด้วยกฎหมายของเราในด้านความปลอดภัยของแพลตฟอร์มและการป้องกันการฉ้อโกง
                        ตามที่กำหนดไว้ใน PDPA มาตรา 24
                    </p>
                </Section>

                <Section number={4} title="การเปิดเผยข้อมูลต่อบุคคลที่สาม">
                    <p>เราจะไม่ขายข้อมูลส่วนบุคคลของท่านให้บุคคลภายนอก และจะเปิดเผยข้อมูลเฉพาะในกรณีต่อไปนี้:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li><span className="font-semibold text-text-main">ระหว่าง Customer และ Provider ที่จับคู่กันแล้ว</span>: ข้อมูลติดต่อพื้นฐานที่จำเป็นต่อการนัดหมาย</li>
                        <li><span className="font-semibold text-text-main">ผู้ให้บริการชำระเงิน (Payment gateway)</span>: เพื่อประมวลผลธุรกรรม</li>
                        <li><span className="font-semibold text-text-main">หน่วยงานราชการ</span>: เมื่อมีคำสั่งตามกฎหมาย</li>
                        <li>
                            <span className="font-semibold text-text-main">โปรไฟล์สาธารณะ</span>: ข้อมูลบางส่วนของ Provider (ชื่อ, Bio, ภาษา, คะแนนรีวิว)
                            จะแสดงต่อสาธารณะ โดย<span className="font-semibold text-text-main">ไม่รวม</span>เลขบัตรประชาชน เลขบัญชีธนาคาร
                            และเบอร์โทรศัพท์ ซึ่งจะถูกซ่อนจากการเข้าถึงสาธารณะ
                        </li>
                    </ul>
                </Section>

                <Section number={5} title="ระยะเวลาการจัดเก็บข้อมูล">
                    <p>
                        เราจัดเก็บข้อมูลส่วนบุคคลตราบเท่าที่จำเป็นต่อวัตถุประสงค์ที่ระบุไว้ หรือตามที่กฎหมายกำหนด โดยข้อมูลธุรกรรมทางการเงินจะถูกเก็บรักษาไว้อย่างน้อย 5 ปี
                        ตามกฎหมายว่าด้วยการบัญชี เมื่อท่านลบบัญชี ข้อมูลส่วนตัวจะถูกลบหรือทำให้ไม่สามารถระบุตัวตนได้ภายในระยะเวลาที่เหมาะสม
                        ยกเว้นข้อมูลที่จำเป็นต้องเก็บไว้เพื่อการปฏิบัติตามกฎหมาย
                    </p>
                </Section>

                <Section number={6} title="มาตรการรักษาความปลอดภัย">
                    <ul className="list-disc list-inside space-y-1">
                        <li>รหัสผ่านจัดเก็บในรูปแบบ hashed (bcrypt) ไม่สามารถอ่านได้แม้เป็นผู้ดูแลระบบ</li>
                        <li>จำกัดสิทธิ์การเข้าถึงข้อมูลอ่อนไหว (เลขบัตรประชาชน, บัญชีธนาคาร) เฉพาะระบบภายในที่จำเป็น</li>
                        <li>เข้ารหัสข้อมูลระหว่างรับส่ง (HTTPS/TLS)</li>
                        <li>Session หมดอายุอัตโนมัติเมื่อไม่มีการใช้งาน</li>
                    </ul>
                </Section>

                <Section number={7} title="สิทธิของเจ้าของข้อมูล (Data Subject Rights)">
                    <p>ภายใต้ PDPA ท่านมีสิทธิดังต่อไปนี้:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li><span className="font-semibold text-text-main">สิทธิเข้าถึง</span>: ขอดูข้อมูลส่วนบุคคลที่เราจัดเก็บ</li>
                        <li><span className="font-semibold text-text-main">สิทธิแก้ไข</span>: แก้ไขข้อมูลให้ถูกต้องผ่านหน้าจัดการโปรไฟล์</li>
                        <li><span className="font-semibold text-text-main">สิทธิถอนความยินยอม</span>: ถอนความยินยอมที่เคยให้ไว้ได้ทุกเมื่อ</li>
                        <li><span className="font-semibold text-text-main">สิทธิลบข้อมูล</span>: ขอให้ลบบัญชีและข้อมูลที่เกี่ยวข้อง (ยกเว้นที่กฎหมายกำหนดให้เก็บ)</li>
                        <li><span className="font-semibold text-text-main">สิทธิคัดค้าน</span>: คัดค้านการประมวลผลข้อมูลเพื่อวัตถุประสงค์บางอย่าง</li>
                        <li><span className="font-semibold text-text-main">สิทธิร้องเรียน</span>: ยื่นเรื่องร้องเรียนต่อสำนักงานคณะกรรมการคุ้มครองข้อมูลส่วนบุคคล (สคส. / PDPC) หากท่านเห็นว่าเราละเมิดสิทธิของท่าน</li>
                    </ul>
                    <p>ท่านสามารถใช้สิทธิเหล่านี้ได้ผ่านหน้าตั้งค่าบัญชี หรือติดต่อทีมงานตามช่องทางในหัวข้อที่ 9</p>
                </Section>

                <Section number={8} title="การให้ความยินยอม">
                    <p>
                        ก่อนสมัครสมาชิก ท่านต้องกดยอมรับ (Checkbox) เพื่อยืนยันว่าได้อ่านและยินยอมตามนโยบายฉบับนี้ หากไม่ให้ความยินยอม
                        ระบบจะไม่สามารถดำเนินการสมัครสมาชิกให้ท่านได้
                    </p>
                </Section>

                <Section number={9} title="ช่องทางติดต่อ">
                    <p>หากมีข้อสงสัยเกี่ยวกับนโยบายความเป็นส่วนตัวฉบับนี้ หรือต้องการใช้สิทธิของท่าน สามารถติดต่อได้ที่:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>อีเมล: [ใส่อีเมลติดต่อ]</li>
                        <li>เจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล (DPO): [ใส่ชื่อ/ตำแหน่ง หากมีการแต่งตั้ง]</li>
                        <li>ผ่านระบบร้องเรียนภายในแพลตฟอร์ม (Report)</li>
                    </ul>
                </Section>

                <Section number={10} title="การเปลี่ยนแปลงนโยบาย">
                    <p>
                        เราอาจปรับปรุงนโยบายนี้เป็นครั้งคราว และจะแจ้งให้ท่านทราบผ่านการแจ้งเตือนในระบบเมื่อมีการเปลี่ยนแปลงที่มีนัยสำคัญ
                    </p>
                </Section>

                <p className="text-xs text-gray-400 italic pt-4 border-t border-gray-100">
                    เอกสารนี้จัดทำขึ้นสำหรับ Sprint 1 (US2-1) — โปรดให้ทีมกฎหมาย/อาจารย์ที่ปรึกษาตรวจทานก่อนเผยแพร่จริง
                </p>
            </div>

            <Footer />
        </div>
    );
}
