package com.kltn.bookstore_be.catalog.infrastructure;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.kltn.bookstore_be.catalog.domain.Category;
import com.kltn.bookstore_be.catalog.domain.CategoryRepository;
import com.kltn.bookstore_be.catalog.domain.Product;
import com.kltn.bookstore_be.catalog.domain.ProductRepository;
import com.kltn.bookstore_be.identity.domain.User;
import com.kltn.bookstore_be.identity.domain.UserRepository;
import com.kltn.bookstore_be.ordering.domain.Coupon;
import com.kltn.bookstore_be.ordering.domain.CouponRepository;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final CouponRepository couponRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository,
            CategoryRepository categoryRepository,
            ProductRepository productRepository,
            CouponRepository couponRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.couponRepository = couponRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("===> Running DataSeeder checks...");

        System.out.println("===> Seeding/Checking Users...");
        if (!userRepository.existsByEmail("user@gmail.com")) {
            User normalUser = User.builder()
                    .fullName("Nguyễn Văn Khách")
                    .email("user@gmail.com")
                    .phone("0987654321")
                    .passwordHash(passwordEncoder.encode("password"))
                    .address("1 Võ Văn Ngân, Linh Chiểu, Thủ Đức, TP. Hồ Chí Minh")
                    .role(User.Role.USER)
                    .status(User.UserStatus.ACTIVE)
                    .build();
            userRepository.save(normalUser);
            System.out.println("Seeded user@gmail.com");
        }

        if (!userRepository.existsByEmail("manager@gmail.com")) {
            User managerUser = User.builder()
                    .fullName("Trần Thị Quản Lý")
                    .email("manager@gmail.com")
                    .phone("0912345678")
                    .passwordHash(passwordEncoder.encode("password"))
                    .address("1 Võ Văn Ngân, Linh Chiểu, Thủ Đức, TP. Hồ Chí Minh")
                    .role(User.Role.MANAGER)
                    .status(User.UserStatus.ACTIVE)
                    .build();
            userRepository.save(managerUser);
            System.out.println("Seeded manager@gmail.com");
        }

        if (!userRepository.existsByEmail("admin@gmail.com")) {
            User adminUser = User.builder()
                    .fullName("Trần Văn Admin")
                    .email("admin@gmail.com")
                    .phone("0923456789")
                    .passwordHash(passwordEncoder.encode("password"))
                    .address("1 Võ Văn Ngân, Linh Chiểu, Thủ Đức, TP. Hồ Chí Minh")
                    .role(User.Role.ADMIN)
                    .status(User.UserStatus.ACTIVE)
                    .build();
            userRepository.save(adminUser);
            System.out.println("Seeded admin@gmail.com");
        }

        if (productRepository.count() < 20) {
            System.out.println("===> Seeding Products and Categories (20+ items)...");
            productRepository.deleteAll();
            categoryRepository.deleteAll();

            String BASE_URL = "https://res.cloudinary.com/diwo0fi2c/image/upload/";

            Category fictionCat = Category.builder().name("Tiểu thuyết").build();
            Category techCat = Category.builder().name("Sách công nghệ").build();
            Category artCat = Category.builder().name("Sách nghệ thuật").build();
            Category psychologyCat = Category.builder().name("Sách tâm lý").build();
            Category businessCat = Category.builder().name("Kinh tế & Quản trị").build();
            Category historyCat = Category.builder().name("Lịch sử & Văn hóa").build();
            Category childrenCat = Category.builder().name("Sách thiếu nhi").build();
            Category scienceCat = Category.builder().name("Khoa học & Đời sống").build();
            Category educationCat = Category.builder().name("Giáo dục & Học tập").build();
            Category comicCat = Category.builder().name("Truyện tranh & Manga").build();
            categoryRepository.saveAll(List.of(fictionCat, techCat, artCat, psychologyCat, businessCat, historyCat, childrenCat, scienceCat, educationCat, comicCat));

            // Danh mục Tiểu thuyết
            // 1. Mật ngữ cuộc đời (Tiểu thuyết)
            Product p1 = Product.builder()
                    .category(fictionCat)
                    .name("Mật ngữ cuộc đời")
                    .author("Patrick Thorne")
                    .publisher("NXB Trẻ")
                    .isbn("9786049764512")
                    .description("Khám phá những bí ẩn sâu xa của số phận và các mối quan hệ con người qua góc nhìn tâm lý học sâu sắc.")
                    .price(new BigDecimal("168000.00"))
                    .stockQuantity(100)
                    .imageUrls(List.of(
                            BASE_URL + "ammuucauket.jpg",
                            BASE_URL + "bookstore_products/tieu-thuyet/mat-ngu-cuoc-doi.png",
                            "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80"
                    ))
                    .status(Product.ProductStatus.ACTIVE)
                    .build();

            // 2. Khoa học về lòng tin (Tiểu thuyết / Tâm lý)
            Product p2 = Product.builder()
                    .category(fictionCat)
                    .name("Khoa học về lòng tin")
                    .author("Arthur Clin")
                    .publisher("NXB Tổng Hợp")
                    .isbn("9780132350884")
                    .description("Phân tích cơ chế tâm lý hình thành và duy trì sự tin tưởng trong xã hội hiện đại.")
                    .price(new BigDecimal("199000.00"))
                    .stockQuantity(100)
                    .imageUrls(List.of(
                            "/src/assets/long_tin.png",
                            "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80"
                    ))
                    .status(Product.ProductStatus.ACTIVE)
                    .build();

            // 3. Bộ sách Nghệ thuật vẽ khoa học (Sách nghệ thuật)
            Product p3 = Product.builder()
                    .category(artCat)
                    .name("Bộ sách Nghệ thuật vẽ khoa học")
                    .author("Dr. Sarah James")
                    .publisher("NXB Mỹ Thuật")
                    .isbn("9786042183592")
                    .description("Hướng dẫn chi tiết từ căn bản đến nâng cao về kỹ thuật phác họa và sử dụng màu sắc trong hội họa hiện đại.")
                    .price(new BigDecimal("272000.00"))
                    .stockQuantity(100)
                    .imageUrls(List.of(
                            "/src/assets/nghe_thuat_ve.png",
                            "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80",
                            "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=800&q=80"
                    ))
                    .status(Product.ProductStatus.ACTIVE)
                    .build();

            // 4. Năng lực quản lý cảm xúc (Sách tâm lý)
            Product p4 = Product.builder()
                    .category(psychologyCat)
                    .name("Năng lực quản lý cảm xúc")
                    .author("Clin McAvoy")
                    .publisher("NXB Lao Động")
                    .isbn("9786045678912")
                    .description("Giúp bạn làm chủ cảm xúc bản thân, cải thiện kỹ năng giao tiếp và cân bằng cuộc sống.")
                    .price(new BigDecimal("195000.00"))
                    .stockQuantity(100)
                    .imageUrls(List.of(
                            "/src/assets/quan_ly_cam_xuc.png",
                            "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80"
                    ))
                    .status(Product.ProductStatus.ACTIVE)
                    .build();

            // 5. Clean Code: A Handbook of Agile Software Craftsmanship (Sách công nghệ)
            Product p5 = Product.builder()
                    .category(techCat)
                    .name("Clean Code: Nghệ Thuật Viết Mã Sạch")
                    .author("Robert C. Martin")
                    .publisher("NXB Thông Tin & Truyền Thông")
                    .isbn("9780132350882")
                    .description("Khám phá các nguyên tắc, quy tắc và công cụ hữu ích để viết mã nguồn rõ ràng, dễ bảo trì và mở rộng.")
                    .price(new BigDecimal("320000.00"))
                    .stockQuantity(80)
                    .imageUrls(List.of(
                            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
                            "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80"
                    ))
                    .status(Product.ProductStatus.ACTIVE)
                    .build();

            // 6. Design Patterns: Elements of Reusable Object-Oriented Software (Sách công nghệ)
            Product p6 = Product.builder()
                    .category(techCat)
                    .name("Design Patterns: Các Mẫu Thiết Kế Hướng Đối Tượng")
                    .author("Erich Gamma, Richard Helm")
                    .publisher("NXB Khoa Học Kỹ Thuật")
                    .isbn("9780201633610")
                    .description("Cuốn sách kinh điển về 23 mẫu thiết kế phần mềm giúp giải quyết nhanh chóng các bài toán lập trình thực tế.")
                    .price(new BigDecimal("350000.00"))
                    .stockQuantity(60)
                    .imageUrls(List.of(
                            "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=800&q=80",
                            "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80"
                    ))
                    .status(Product.ProductStatus.ACTIVE)
                    .build();

            // 7. Đắc Nhân Tâm (Sách tâm lý)
            Product p7 = Product.builder()
                    .category(psychologyCat)
                    .name("Đắc Nhân Tâm")
                    .author("Dale Carnegie")
                    .publisher("NXB Tổng Hợp TP.HCM")
                    .isbn("9786045839211")
                    .description("Tác phẩm nổi tiếng thế giới về nghệ thuật thu phục lòng người và gặt hái thành công trong giao tiếp.")
                    .price(new BigDecimal("120000.00"))
                    .stockQuantity(150)
                    .imageUrls(List.of(
                            "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=800&q=80",
                            "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=800&q=80"
                    ))
                    .status(Product.ProductStatus.ACTIVE)
                    .build();

            // 8. Nhà Giả Kim (Tiểu thuyết)
            Product p8 = Product.builder()
                    .category(fictionCat)
                    .name("Nhà Giả Kim")
                    .author("Paulo Coelho")
                    .publisher("NXB Hội Nhà Văn")
                    .isbn("9786045378912")
                    .description("Hành trình của chàng chăn cừu Santiago theo đuổi giấc mơ, tìm kiếm kho báu và lắng nghe trái tim mình.")
                    .price(new BigDecimal("98000.00"))
                    .stockQuantity(200)
                    .imageUrls(List.of(
                            "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=800&q=80",
                            "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80"
                    ))
                    .status(Product.ProductStatus.ACTIVE)
                    .build();

            // 9. Tư Duy Nhanh Và Chậm (Sách tâm lý)
            Product p9 = Product.builder()
                    .category(psychologyCat)
                    .name("Tư Duy Nhanh Và Chậm")
                    .author("Daniel Kahneman")
                    .publisher("NXB Thế Giới")
                    .isbn("9786047754123")
                    .description("Phân tích hai hệ thống tư duy của con người: Hệ thống 1 trực giác, cảm xúc và Hệ thống 2 lý trí, logic.")
                    .price(new BigDecimal("235000.00"))
                    .stockQuantity(90)
                    .imageUrls(List.of(
                            "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80",
                            "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=800&q=80"
                    ))
                    .status(Product.ProductStatus.ACTIVE)
                    .build();

            // 10. Lược Sử Thời Gian (Sách công nghệ / Khoa học)
            Product p10 = Product.builder()
                    .category(techCat)
                    .name("Lược Sử Thời Gian")
                    .author("Stephen Hawking")
                    .publisher("NXB Trẻ")
                    .isbn("9786041234567")
                    .description("Cuốn sách kinh điển giải mã bí ẩn về vũ từ lỗ đen, vụ nổ Big Bang cho đến bản chất thực sự của thời gian.")
                    .price(new BigDecimal("155000.00"))
                    .stockQuantity(120)
                    .imageUrls(List.of(
                            "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
                            "https://images.unsplash.com/photo-1507842229356-51c6150fe5a3?auto=format&fit=crop&w=800&q=80"
                    ))
                    .status(Product.ProductStatus.ACTIVE)
                    .build();

            // Danh mục Kinh tế chính trị
            // 01. Âm mưu câu kết - Luke Harding
            Product p11 = Product.builder()
                    .category(businessCat)
                    .name("Âm mưu câu kết")
                    .author("Luke Harding")
                    .publisher("NXB Nhã Nam")
                    .isbn("9786049876543")
                    .description("Bài học tài chính thực tiễn về cách người giàu tư duy về tiền bạc, đầu tư và tự do tài chính.")
                    .price(new BigDecimal("145000.00"))
                    .stockQuantity(180)
                    .imageUrls(List.of(
                            "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/am-muu-cau-ket--Luke-Harding/amck-01.jpg",
                            "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/am-muu-cau-ket--Luke-Harding/amck-02.jpg",
                            "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/am-muu-cau-ket--Luke-Harding/amck-03.jpg",
                            "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/am-muu-cau-ket--Luke-Harding/amck-04.jpg",
                            "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/am-muu-cau-ket--Luke-Harding/amck-05.jpg",
                            "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/am-muu-cau-ket--Luke-Harding/amck-06.jpg",
                            "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/am-muu-cau-ket--Luke-Harding/amck-07.jpg",
                            "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/am-muu-cau-ket--Luke-Harding/amck-08.jpg",
                            "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/am-muu-cau-ket--Luke-Harding/amck-09.jpg",
                            "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/am-muu-cau-ket--Luke-Harding/amck-10.jpg",
                            "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/am-muu-cau-ket--Luke-Harding/amck-11.jpg"
                    ))
                    .status(Product.ProductStatus.ACTIVE)
                    .build();

            // 12. Từ Tốt Đến Vĩ Đại (Kinh tế & Quản trị)
            Product p12 = Product.builder()
                    .category(businessCat)
                    .name("Bản đồ tài nguyên thế giới")
                    .author("Masanori Tobita")
                    .publisher("NXB Nhã Nam")
                    .isbn("9786043456789")
                    .description("Nghiên cứu sâu rộng về các công ty vĩ đại, tìm ra công thức bước ngoặt giúp doanh nghiệp bứt phá ngoạn mục.")
                    .price(new BigDecimal("210000.00"))
                    .stockQuantity(110)
                    .imageUrls(List.of(
                            "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/ban-do-tai-nguyen-the-gioi--Masanori-Tobita/bdtntg-01.jpg",
                            "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/ban-do-tai-nguyen-the-gioi--Masanori-Tobita/bdtntg-02.jpg",
                            "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/ban-do-tai-nguyen-the-gioi--Masanori-Tobita/bdtntg-03.jpg",
                            "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/ban-do-tai-nguyen-the-gioi--Masanori-Tobita/bdtntg-04.jpg",
                            "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/ban-do-tai-nguyen-the-gioi--Masanori-Tobita/bdtntg-05.jpg",
                            "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/ban-do-tai-nguyen-the-gioi--Masanori-Tobita/bdtntg-06.jpg",
                            "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/ban-do-tai-nguyen-the-gioi--Masanori-Tobita/bdtntg-07.jpg",
                            "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/ban-do-tai-nguyen-the-gioi--Masanori-Tobita/bdtntg-08.jpg",
                            "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/ban-do-tai-nguyen-the-gioi--Masanori-Tobita/bdtntg-09.jpg"
                    ))
                    .status(Product.ProductStatus.ACTIVE)
                    .build();

            // 13. Sapiens: Lược Sử Loài Người (Lịch sử & Văn hóa)
            Product p13 = Product.builder()
                    .category(historyCat)
                    .name("Sapiens: Lược Sử Loài Người")
                    .author("Yuval Noah Harari")
                    .publisher("NXB Tri Thức")
                    .isbn("9786046543210")
                    .description("Toàn cảnh tiến trình phát triển vĩ đại và đầy biến động của loài người từ thời kỳ đồ đá đến thế kỷ 21.")
                    .price(new BigDecimal("280000.00"))
                    .stockQuantity(130)
                    .imageUrls(List.of(
                            "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=800&q=80",
                            "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80"
                    ))
                    .status(Product.ProductStatus.ACTIVE)
                    .build();

            // 14. Súng, Vi Trùng Và Thép (Lịch sử & Văn hóa)
            Product p14 = Product.builder()
                    .category(historyCat)
                    .name("Súng, Vi Trùng Và Thép")
                    .author("Jared Diamond")
                    .publisher("NXB Thế Giới")
                    .isbn("9786048889991")
                    .description("Giải thích định mệnh các xã hội loài người dưới góc độ địa lý, sinh thái và tiến hóa lịch sử.")
                    .price(new BigDecimal("260000.00"))
                    .stockQuantity(85)
                    .imageUrls(List.of(
                            "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80",
                            "https://images.unsplash.com/photo-1544716278-e513176f20b5?auto=format&fit=crop&w=800&q=80"
                    ))
                    .status(Product.ProductStatus.ACTIVE)
                    .build();

            // 15. Hoàng Tử Bé (Sách thiếu nhi / Tiểu thuyết)
            Product p15 = Product.builder()
                    .category(childrenCat)
                    .name("Hoàng Tử Bé")
                    .author("Antoine de Saint-Exupéry")
                    .publisher("NXB Kim Đồng")
                    .isbn("9786042111222")
                    .description("Câu chuyện thơ mộng và triết lý sâu sắc về tình bạn, tình yêu và cái nhìn thuần khiết của trẻ thơ.")
                    .price(new BigDecimal("75000.00"))
                    .stockQuantity(250)
                    .imageUrls(List.of(
                            "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=800&q=80",
                            "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80"
                    ))
                    .status(Product.ProductStatus.ACTIVE)
                    .build();

            // 16. Harry Potter Và Hòn Đá Phù Thủy (Sách thiếu nhi / Tiểu thuyết)
            Product p16 = Product.builder()
                    .category(childrenCat)
                    .name("Harry Potter Và Hòn Đá Phù Thủy")
                    .author("J.K. Rowling")
                    .publisher("NXB Trẻ")
                    .isbn("9786041113334")
                    .description("Tập đầu tiên trong loạt truyện kỳ diệu về thế giới pháp thuật và hành trình phiêu lưu của cậu bé phù thủy Harry Potter.")
                    .price(new BigDecimal("185000.00"))
                    .stockQuantity(170)
                    .imageUrls(List.of(
                            "https://images.unsplash.com/photo-1618666012174-83b441c0bc76?auto=format&fit=crop&w=800&q=80",
                            "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80"
                    ))
                    .status(Product.ProductStatus.ACTIVE)
                    .build();

            // 17. Nghệ Thuật Bài Trí Của Người Nhật (Sách nghệ thuật / Đời sống)
            Product p17 = Product.builder()
                    .category(artCat)
                    .name("Nghệ Thuật Bài Trí Của Người Nhật")
                    .author("Marie Kondo")
                    .publisher("NXB Lao Động")
                    .isbn("9786045556667")
                    .description("Phương pháp dọn dẹp và tổ chức không gian sống thần kỳ KonMari đem lại niềm vui và bình an.")
                    .price(new BigDecimal("135000.00"))
                    .stockQuantity(95)
                    .imageUrls(List.of(
                            "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
                            "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80"
                    ))
                    .status(Product.ProductStatus.ACTIVE)
                    .build();

            // 18. Lập Trình Và Cuộc Sống (Sách công nghệ)
            Product p18 = Product.builder()
                    .category(techCat)
                    .name("The Pragmatic Programmer: Người Thợ Lập Trình Thực Thụ")
                    .author("David Thomas, Andrew Hunt")
                    .publisher("NXB Khoa Học Kỹ Thuật")
                    .isbn("9780135957059")
                    .description("Cẩm nang quý giá về tư duy thực tiễn, thói quen nghề nghiệp và cách phát triển phần mềm hiệu quả.")
                    .price(new BigDecimal("299000.00"))
                    .stockQuantity(70)
                    .imageUrls(List.of(
                            "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
                            "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80"
                    ))
                    .status(Product.ProductStatus.ACTIVE)
                    .build();

            // 19. Tâm Lý Học Hành Vi (Sách tâm lý)
            Product p19 = Product.builder()
                    .category(psychologyCat)
                    .name("Tâm Lý Học Hành Vi")
                    .author("Khánh Ngọc (Dịch)")
                    .publisher("NXB Thanh Niên")
                    .isbn("9786047778889")
                    .description("Tìm hiểu động cơ bí ẩn đằng sau các hành vi hàng ngày, ngôn ngữ cơ thể và tâm lý giao tiếp.")
                    .price(new BigDecimal("160000.00"))
                    .stockQuantity(115)
                    .imageUrls(List.of(
                            "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
                            "https://images.unsplash.com/photo-1507842229356-51c6150fe5a3?auto=format&fit=crop&w=800&q=80"
                    ))
                    .status(Product.ProductStatus.ACTIVE)
                    .build();

            // 20. Bắt Trẻ Đồng Xanh (Tiểu thuyết)
            Product p20 = Product.builder()
                    .category(fictionCat)
                    .name("Bắt Trẻ Đồng Xanh")
                    .author("J.D. Salinger")
                    .publisher("NXB Văn Học")
                    .isbn("9786049990001")
                    .description("Tác phẩm văn học kinh điển phản ánh tâm tư nổi loạn và chân thật của tuổi trẻ trước thế giới người lớn.")
                    .price(new BigDecimal("115000.00"))
                    .stockQuantity(140)
                    .imageUrls(List.of(
                            "https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=800&q=80",
                            "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=800&q=80"
                    ))
                    .status(Product.ProductStatus.ACTIVE)
                    .build();

            productRepository.saveAll(List.of(
                    p1, p2, p3, p4, p5, p6, p7, p8, p9, p10,
                    p11, p12, p13, p14, p15, p16, p17, p18, p19, p20
            ));
            System.out.println("===> Seeded 20 rich book products successfully!");
        }

        System.out.println("===> Seeding Coupons...");
        if (couponRepository.findByCode("WELCOME10").isEmpty()) {
            Coupon coupon = Coupon.builder()
                    .code("WELCOME10")
                    .description("Giảm giá 10% chào mừng khách hàng mới")
                    .discountType(Coupon.DiscountType.PERCENT)
                    .discountValue(new BigDecimal("10.00"))
                    .minOrderValue(new BigDecimal("0.00"))
                    .maxDiscountAmount(new BigDecimal("50000.00"))
                    .usageLimit(100)
                    .startDate(LocalDateTime.now().minusDays(1))
                    .endDate(LocalDateTime.now().plusMonths(6))
                    .status(Coupon.CouponStatus.ACTIVE)
                    .build();
            couponRepository.save(coupon);
        }

        if (couponRepository.findByCode("GIAM20K").isEmpty()) {
            Coupon c1 = Coupon.builder()
                    .code("GIAM20K")
                    .description("Giảm ngay 20.000đ cho đơn hàng từ 100.000đ")
                    .discountType(Coupon.DiscountType.FIXED)
                    .discountValue(new BigDecimal("20000.00"))
                    .minOrderValue(new BigDecimal("100000.00"))
                    .maxDiscountAmount(new BigDecimal("20000.00"))
                    .usageLimit(1000)
                    .startDate(LocalDateTime.now().minusDays(5))
                    .endDate(LocalDateTime.now().plusMonths(12))
                    .status(Coupon.CouponStatus.ACTIVE)
                    .build();
            couponRepository.save(c1);
        }

        if (couponRepository.findByCode("GIAM10PCT").isEmpty()) {
            Coupon c2 = Coupon.builder()
                    .code("GIAM10PCT")
                    .description("Giảm 10% (tối đa 50.000đ) cho đơn hàng từ 150.000đ")
                    .discountType(Coupon.DiscountType.PERCENT)
                    .discountValue(new BigDecimal("10.00"))
                    .minOrderValue(new BigDecimal("150000.00"))
                    .maxDiscountAmount(new BigDecimal("50000.00"))
                    .usageLimit(1000)
                    .startDate(LocalDateTime.now().minusDays(5))
                    .endDate(LocalDateTime.now().plusMonths(12))
                    .status(Coupon.CouponStatus.ACTIVE)
                    .build();
            couponRepository.save(c2);
        }

        if (couponRepository.findByCode("GIAM50K").isEmpty()) {
            Coupon c3 = Coupon.builder()
                    .code("GIAM50K")
                    .description("Giảm cực khủng 50.000đ cho đơn hàng từ 300.000đ")
                    .discountType(Coupon.DiscountType.FIXED)
                    .discountValue(new BigDecimal("50000.00"))
                    .minOrderValue(new BigDecimal("300000.00"))
                    .maxDiscountAmount(new BigDecimal("50000.00"))
                    .usageLimit(1000)
                    .startDate(LocalDateTime.now().minusDays(5))
                    .endDate(LocalDateTime.now().plusMonths(12))
                    .status(Coupon.CouponStatus.ACTIVE)
                    .build();
            couponRepository.save(c3);
        }

        System.out.println("===> DataSeeder checks completed successfully!");
    }
}
