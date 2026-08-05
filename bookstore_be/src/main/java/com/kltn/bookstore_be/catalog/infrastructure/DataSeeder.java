package com.kltn.bookstore_be.catalog.infrastructure;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

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

    private static final String BASE_URL = "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products";
    private static final SecureRandom RANDOM = new SecureRandom();

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

        seedUsers();
        seedCatalog();
        seedCoupons();

        System.out.println("===> DataSeeder checks completed successfully!");
    }

    private void seedUsers() {
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
        }
    }

    private void seedCatalog() {
        System.out.println("===> Seeding/Checking Catalog...");
        // Never replace an existing catalog at application startup. Products can
        // already be referenced by cart items, orders, reviews, and favorites.
        // Seed only a brand-new database, otherwise preserve operational data.
        if (productRepository.count() == 0) {

            Category scienceCat = categoryRepository.save(Category.builder().name("Khoa học").build());
            Category businessCat = categoryRepository.save(Category.builder().name("Kinh tế & Chính trị").build());

            Product p1 = Product.builder()
                    .category(scienceCat)
                    .name("Bản đồ tri thức")
                    .author("Violet Moller")
                    .publisher("NXB Nhã Nam")
                    .isbn(generateIsbn("Bản đồ tri thức"))
                    .description("Hành trình qua những trung tâm tri thức đã làm thay đổi lịch sử văn minh nhân loại.")
                    .price(new BigDecimal("215000"))
                    .stockQuantity(85)
                    .imageUrls(List.of(
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/ban-do-tri-thuc--Violet-Moller/bdtt-01.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/ban-do-tri-thuc--Violet-Moller/bdtt-02.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/ban-do-tri-thuc--Violet-Moller/bdtt-03.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/ban-do-tri-thuc--Violet-Moller/bdtt-04.jpg"
                    ))
                    .status(Product.ProductStatus.ACTIVE)
                    .build();

            Product p2 = Product.builder()
                    .category(scienceCat)
                    .name("Bật mí bí mật về động vật")
                    .author("James Maclaine")
                    .publisher("NXB Nhã Nam")
                    .isbn(generateIsbn("Bật mí bí mật về động vật"))
                    .description("Những sự thật thú vị và bất ngờ về thế giới động vật quanh ta.")
                    .price(new BigDecimal("165000"))
                    .stockQuantity(120)
                    .imageUrls(List.of(
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/bat-mi-bi-mat-ve-dong-vat--James-Maclaine/bmbmvdv-01.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/bat-mi-bi-mat-ve-dong-vat--James-Maclaine/bmbmvdv-02.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/bat-mi-bi-mat-ve-dong-vat--James-Maclaine/bmbmvdv-03.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/bat-mi-bi-mat-ve-dong-vat--James-Maclaine/bmbmvdv-04.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/bat-mi-bi-mat-ve-dong-vat--James-Maclaine/bmbmvdv-05.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/bat-mi-bi-mat-ve-dong-vat--James-Maclaine/bmbmvdv-06.jpg"
                    ))
                    .status(Product.ProductStatus.ACTIVE)
                    .build();

            Product p3 = Product.builder()
                    .category(scienceCat)
                    .name("Bên trong tâm trí")
                    .author("Jorge Cham, Dwayne Godwin")
                    .publisher("NXB Khoa Học Kỹ Thuật")
                    .isbn(generateIsbn("Bên trong tâm trí"))
                    .description("Giải thích các cơ chế khoa học đang diễn ra bên trong bộ não con người.")
                    .price(new BigDecimal("189000.00"))
                    .stockQuantity(95)
                    .imageUrls(List.of(
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/ben-trong-tam-tri--Jorge-Cham--Dwayne-Godwin/bttt-01.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/ben-trong-tam-tri--Jorge-Cham--Dwayne-Godwin/bttt-02.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/ben-trong-tam-tri--Jorge-Cham--Dwayne-Godwin/bttt-03.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/ben-trong-tam-tri--Jorge-Cham--Dwayne-Godwin/bttt-04.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/ben-trong-tam-tri--Jorge-Cham--Dwayne-Godwin/bttt-05.jpg"
                    ))
                    .status(Product.ProductStatus.ACTIVE)
                    .build();

            Product p4 = Product.builder()
                    .category(scienceCat)
                    .name("Bức tranh toàn cảnh")
                    .author("Sean Carroll")
                    .publisher("NXB Nhã Nam")
                    .isbn(generateIsbn("Bức tranh toàn cảnh"))
                    .description("Một bức tranh lớn về cách vũ trụ, vật chất và ý thức vận hành.")
                    .price(new BigDecimal("245000"))
                    .stockQuantity(70)
                    .imageUrls(List.of(
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/buc-tranh-toan-canh--Sean-Caroll/bttc-01.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/buc-tranh-toan-canh--Sean-Caroll/bttc-02.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/buc-tranh-toan-canh--Sean-Caroll/bttc-03.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/buc-tranh-toan-canh--Sean-Caroll/bttc-04.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/buc-tranh-toan-canh--Sean-Caroll/bttc-05.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/buc-tranh-toan-canh--Sean-Caroll/bttc-06.jpg"
                    ))
                    .status(Product.ProductStatus.ACTIVE)
                    .build();

            Product p5 = Product.builder()
                    .category(scienceCat)
                    .name("Định luật Murphy")
                    .author("Lý Thế Cường")
                    .publisher("NXB Trẻ")
                    .isbn(generateIsbn("Định luật Murphy"))
                    .description("Những góc nhìn vui nhộn và thực tế về xác suất rủi ro trong đời sống.")
                    .price(new BigDecimal("125000.00"))
                    .stockQuantity(140)
                    .imageUrls(List.of(
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/dinh-luat-murphy--Ly-The-Cuong/dlmurphy-01.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/dinh-luat-murphy--Ly-The-Cuong/dlmurphy-02.jpg"
                    ))
                    .status(Product.ProductStatus.ACTIVE)
                    .build();

            Product p6 = Product.builder()
                    .category(scienceCat)
                    .name("Gan ơi là gan")
                    .author("Gabriel Perlemuter")
                    .publisher("NXB Phụ Nữ Việt Nam")
                    .isbn(generateIsbn("Gan ơi là gan"))
                    .description("Cuốn sách giúp hiểu hơn về sức khỏe, cơ thể và lối sống khoa học.")
                    .price(new BigDecimal("139000.00"))
                    .stockQuantity(100)
                    .imageUrls(List.of(
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/gan-oi-la-gan--Gabriel-Perlemuter/golg-01.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/gan-oi-la-gan--Gabriel-Perlemuter/golg-02.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/gan-oi-la-gan--Gabriel-Perlemuter/golg-03.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/gan-oi-la-gan--Gabriel-Perlemuter/golg-04.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/gan-oi-la-gan--Gabriel-Perlemuter/golg-05.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/gan-oi-la-gan--Gabriel-Perlemuter/golg-06.jpg"
                    ))
                    .status(Product.ProductStatus.ACTIVE)
                    .build();

            Product p7 = Product.builder()
                    .category(scienceCat)
                    .name("Khăn gói lên sao Hỏa")
                    .author("Mary Roach")
                    .publisher("NXB Nhã Nam")
                    .isbn(generateIsbn("Khăn gói lên sao Hỏa"))
                    .description("Một chuyến khám phá hài hước về việc con người chuẩn bị cho cuộc sống ngoài Trái Đất.")
                    .price(new BigDecimal("179000"))
                    .stockQuantity(90)
                    .imageUrls(List.of(
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/khan-goi-len-sao-hoa--Mary-Roach/kglsh-01.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/khan-goi-len-sao-hoa--Mary-Roach/kglsh-02.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/khan-goi-len-sao-hoa--Mary-Roach/kglsh-03.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/khan-goi-len-sao-hoa--Mary-Roach/kglsh-04.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/khan-goi-len-sao-hoa--Mary-Roach/kglsh-05.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/khan-goi-len-sao-hoa--Mary-Roach/kglsh-06.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/khan-goi-len-sao-hoa--Mary-Roach/kglsh-07.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/khan-goi-len-sao-hoa--Mary-Roach/kglsh-08.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/khan-goi-len-sao-hoa--Mary-Roach/kglsh-09.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/khan-goi-len-sao-hoa--Mary-Roach/kglsh-10.jpg"
                    ))
                    .status(Product.ProductStatus.ACTIVE)
                    .build();

            Product p8 = Product.builder()
                    .category(scienceCat)
                    .name("Khoa học về chạy bộ")
                    .author("Chris Napier")
                    .publisher("NXB Thể Thao")
                    .isbn(generateIsbn("Khoa học về chạy bộ"))
                    .description("Phân tích khoa học vận động, kỹ thuật và cách tránh chấn thương khi chạy.")
                    .price(new BigDecimal("155000"))
                    .stockQuantity(110)
                    .imageUrls(List.of(
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/khoa-hoc-ve-chay-bo--Chris-Napier/khvcb-01.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/khoa-hoc-ve-chay-bo--Chris-Napier/khvcb-02.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/khoa-hoc-ve-chay-bo--Chris-Napier/khvcb-03.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/khoa-hoc-ve-chay-bo--Chris-Napier/khvcb-04.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/khoa-hoc-ve-chay-bo--Chris-Napier/khvcb-05.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/khoa-hoc-ve-chay-bo--Chris-Napier/khvcb-06.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/khoa-hoc-ve-chay-bo--Chris-Napier/khvcb-07.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/khoa-hoc-ve-chay-bo--Chris-Napier/khvcb-08.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/khoa-hoc-ve-chay-bo--Chris-Napier/khvcb-09.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/khoa-hoc-ve-chay-bo--Chris-Napier/khvcb-10.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/khoa-hoc-ve-chay-bo--Chris-Napier/khvcb-11.jpg"
                    ))
                    .status(Product.ProductStatus.ACTIVE)
                    .build();

            Product p9 = Product.builder()
                    .category(scienceCat)
                    .name("Khoa học về lối sống")
                    .author("Stuart Farrimond")
                    .publisher("NXB Trẻ")
                    .isbn(generateIsbn("Khoa học về lối sống"))
                    .description("Những nguyên tắc khoa học giúp cải thiện thói quen sống mỗi ngày.")
                    .price(new BigDecimal("175000.00"))
                    .stockQuantity(105)
                    .imageUrls(List.of(
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/khoa-hoc-ve-loi-song--Stuart-Farrimond/khvls-01.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/khoa-hoc-ve-loi-song--Stuart-Farrimond/khvls-02.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/khoa-hoc-ve-loi-song--Stuart-Farrimond/khvls-03.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/khoa-hoc-ve-loi-song--Stuart-Farrimond/khvls-04.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/khoa-hoc-ve-loi-song--Stuart-Farrimond/khvls-05.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/khoa-hoc-ve-loi-song--Stuart-Farrimond/khvls-06.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/khoa-hoc-ve-loi-song--Stuart-Farrimond/khvls-07.jpg"
                    ))
                    .status(Product.ProductStatus.ACTIVE)
                    .build();

            Product p10 = Product.builder()
                    .category(scienceCat)
                    .name("Làm sao để")
                    .author("Randall Munroe")
                    .publisher("NXB Khoa Học Kỹ Thuật")
                    .isbn(generateIsbn("Làm sao để"))
                    .description("Trả lời những câu hỏi tưởng chừng đơn giản bằng tư duy khoa học và hài hước.")
                    .price(new BigDecimal("199000"))
                    .stockQuantity(80)
                    .imageUrls(List.of(
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/lam-sao-de--Randall-Munroe/lsd-01.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/lam-sao-de--Randall-Munroe/lsd-02.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/lam-sao-de--Randall-Munroe/lsd-03.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/lam-sao-de--Randall-Munroe/lsd-04.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/lam-sao-de--Randall-Munroe/lsd-05.jpg"
                    ))
                    .status(Product.ProductStatus.ACTIVE)
                    .build();

            Product p11 = Product.builder()
                    .category(scienceCat)
                    .name("Lính trơn")
                    .author("Mary Roach")
                    .publisher("NXB Trẻ")
                    .isbn(generateIsbn("Lính trơn"))
                    .description("Khám phá những câu chuyện lạ lùng và thú vị về con người cùng thế giới tự nhiên.")
                    .price(new BigDecimal("149000.00"))
                    .stockQuantity(75)
                    .imageUrls(List.of(
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/linh-tron--Mary-Roach/lt-01.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/linh-tron--Mary-Roach/lt-02.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/linh-tron--Mary-Roach/lt-03.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/linh-tron--Mary-Roach/lt-04.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/linh-tron--Mary-Roach/lt-05.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/linh-tron--Mary-Roach/lt-06.jpg"
                   ))
                    .status(Product.ProductStatus.ACTIVE)
                    .build();

            Product p12 = Product.builder()
                    .category(scienceCat)
                    .name("Mở khóa vũ trụ")
                    .author("Stephen Hawking")
                    .publisher("NXB Khoa Học Kỹ Thuật")
                    .isbn(generateIsbn("Mở khóa vũ trụ"))
                    .description("Những ý tưởng nền tảng giúp mở ra cái nhìn hiện đại về không gian và vũ trụ.")
                    .price(new BigDecimal("225000.00"))
                    .stockQuantity(130)
                    .imageUrls(List.of(
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/mo-khoa-vu-tru--Stephen-Hawking/mkvt-01.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/mo-khoa-vu-tru--Stephen-Hawking/mkvt-02.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/mo-khoa-vu-tru--Stephen-Hawking/mkvt-03.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/mo-khoa-vu-tru--Stephen-Hawking/mkvt-04.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/mo-khoa-vu-tru--Stephen-Hawking/mkvt-05.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/mo-khoa-vu-tru--Stephen-Hawking/mkvt-06.jpg"
                    ))
                    .status(Product.ProductStatus.ACTIVE)
                    .build();

            Product p13 = Product.builder()
                    .category(scienceCat)
                    .name("Phong cách NVIDIA")
                    .author("Tae Kim")
                    .publisher("NXB Công Thương")
                    .isbn(generateIsbn("Phong cách NVIDIA"))
                    .description("Câu chuyện tăng trưởng của NVIDIA và tư duy điều hành phía sau thành công đó.")
                    .price(new BigDecimal("265000.00"))
                    .stockQuantity(65)
                    .imageUrls(List.of(
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/phong-cach-nvidia--Tae-Kim/pcnvidia-01.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/phong-cach-nvidia--Tae-Kim/pcnvidia-02.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/phong-cach-nvidia--Tae-Kim/pcnvidia-03.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/phong-cach-nvidia--Tae-Kim/pcnvidia-04.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/phong-cach-nvidia--Tae-Kim/pcnvidia-05.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/phong-cach-nvidia--Tae-Kim/pcnvidia-06.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/phong-cach-nvidia--Tae-Kim/pcnvidia-07.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/phong-cach-nvidia--Tae-Kim/pcnvidia-08.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/phong-cach-nvidia--Tae-Kim/pcnvidia-09.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/phong-cach-nvidia--Tae-Kim/pcnvidia-10.jpg"
                    ))
                    .status(Product.ProductStatus.ACTIVE)
                    .build();

            Product p14 = Product.builder()
                    .category(scienceCat)
                    .name("Thiết kế hệ thống học máy")
                    .author("Chip Nguyen")
                    .publisher("NXB Khoa Học Kỹ Thuật")
                    .isbn(generateIsbn("Thiết kế hệ thống học máy"))
                    .description("Cẩm nang xây dựng hệ thống machine learning từ dữ liệu đến triển khai thực tế.")
                    .price(new BigDecimal("289000.00"))
                    .stockQuantity(60)
                    .imageUrls(List.of(
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/thiet-ke-he-thong-hoc-may--Chip-Nguyen/tkhthm-01.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/thiet-ke-he-thong-hoc-may--Chip-Nguyen/tkhthm-02.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/thiet-ke-he-thong-hoc-may--Chip-Nguyen/tkhthm-03.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/thiet-ke-he-thong-hoc-may--Chip-Nguyen/tkhthm-04.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/khoa-hoc/thiet-ke-he-thong-hoc-may--Chip-Nguyen/tkhthm-05.jpg"
                    ))
                    .status(Product.ProductStatus.ACTIVE)
                    .build();

            Product p15 = Product.builder()
                    .category(businessCat)
                    .name("Âm mưu câu kết")
                    .author("Luke Harding")
                    .publisher("NXB Nhã Nam")
                    .isbn(generateIsbn("Âm mưu câu kết"))
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

            Product p16 = Product.builder()
                    .category(businessCat)
                    .name("Bản đồ tài nguyên thế giới")
                    .author("Masanori Tobita")
                    .publisher("NXB Nhã Nam")
                    .isbn(generateIsbn("Bản đồ tài nguyên thế giới"))
                    .description("Bức tranh toàn cảnh về tài nguyên và địa chính trị trong nền kinh tế hiện đại.")
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

            Product p17 = Product.builder()
                    .category(businessCat)
                    .name("Cách mạng siêu nhân hóa")
                    .author("Luc Ferry")
                    .publisher("NXB Chính Trị Quốc Gia")
                    .isbn(generateIsbn("Cách mạng siêu nhân hóa"))
                    .description("Phân tích làn sóng công nghệ đang tái định nghĩa con người và xã hội.")
                    .price(new BigDecimal("195000.00"))
                    .stockQuantity(85)
                    .imageUrls(List.of(
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/cach-mang-sieu-nhan-hoa--Luc-Ferry/cmsnh-01.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/cach-mang-sieu-nhan-hoa--Luc-Ferry/cmsnh-02.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/cach-mang-sieu-nhan-hoa--Luc-Ferry/cmsnh-03.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/cach-mang-sieu-nhan-hoa--Luc-Ferry/cmsnh-04.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/cach-mang-sieu-nhan-hoa--Luc-Ferry/cmsnh-05.jpg"
                    ))
                    .status(Product.ProductStatus.ACTIVE)
                    .build();

            Product p18 = Product.builder()
                    .category(businessCat)
                    .name("Chiến lược kinh doanh")
                    .author("Jeremy Kourdi")
                    .publisher("NXB Lao Động")
                    .isbn(generateIsbn("Chiến lược kinh doanh"))
                    .description("Các nguyên tắc cốt lõi để xây dựng chiến lược và phát triển doanh nghiệp bền vững.")
                    .price(new BigDecimal("175000.00"))
                    .stockQuantity(100)
                    .imageUrls(List.of(
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/chien-luoc-kinh-doanh--Jeremy-Kourdi/clkd-01.jpg"
                    ))
                    .status(Product.ProductStatus.ACTIVE)
                    .build();

            Product p19 = Product.builder()
                    .category(businessCat)
                    .name("Chủ nghĩa tư bản và tự do")
                    .author("Milton Friedman")
                    .publisher("NXB Tri Thức")
                    .isbn(generateIsbn("Chủ nghĩa tư bản và tự do"))
                    .description("Tác phẩm kinh điển bàn về tự do kinh tế, thị trường và vai trò của nhà nước.")
                    .price(new BigDecimal("235000.00"))
                    .stockQuantity(90)
                    .imageUrls(List.of(
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/chu-nghia-tu-ban-va-tu-do--Milton-Friedman/cntbvtd-01.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/chu-nghia-tu-ban-va-tu-do--Milton-Friedman/cntbvtd-02.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/chu-nghia-tu-ban-va-tu-do--Milton-Friedman/cntbvtd-03.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/chu-nghia-tu-ban-va-tu-do--Milton-Friedman/cntbvtd-04.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/chu-nghia-tu-ban-va-tu-do--Milton-Friedman/cntbvtd-05.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/chu-nghia-tu-ban-va-tu-do--Milton-Friedman/cntbvtd-06.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/chu-nghia-tu-ban-va-tu-do--Milton-Friedman/cntbvtd-07.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/chu-nghia-tu-ban-va-tu-do--Milton-Friedman/cntbvtd-08.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/chu-nghia-tu-ban-va-tu-do--Milton-Friedman/cntbvtd-09.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/chu-nghia-tu-ban-va-tu-do--Milton-Friedman/cntbvtd-10.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/chu-nghia-tu-ban-va-tu-do--Milton-Friedman/cntbvtd-11.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/chu-nghia-tu-ban-va-tu-do--Milton-Friedman/cntbvtd-12.jpg"
                    ))
                    .status(Product.ProductStatus.ACTIVE)
                    .build();

            Product p20 = Product.builder()
                    .category(businessCat)
                    .name("COVID-19")
                    .author("Debora Mackenzie")
                    .publisher("NXB Thế Giới")
                    .isbn(generateIsbn("COVID-19"))
                    .description("Một góc nhìn dễ hiểu về đại dịch, khoa học dịch tễ và cách thế giới ứng phó.")
                    .price(new BigDecimal("165000.00"))
                    .stockQuantity(140)
                    .imageUrls(List.of(
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/covid-19--Debora-Mackenzie/covid19-01.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/covid-19--Debora-Mackenzie/covid19-02.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/covid-19--Debora-Mackenzie/covid19-03.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/covid-19--Debora-Mackenzie/covid19-04.jpg"
                    ))
                    .status(Product.ProductStatus.ACTIVE)
                    .build();

            Product p21 = Product.builder()
                .category(businessCat)
                .name("Cuộc chiến vi mạch")
                .author("Chris Miller")
                .publisher("NXB Khoa Học Kỹ Thuật")
                .isbn(generateIsbn("Cuộc chiến vi mạch"))
                .description("Lịch sử cạnh tranh công nghệ đằng sau những con chip quyết định thời đại số.")
                .price(new BigDecimal("229000.00"))
                .stockQuantity(95)
                .imageUrls(List.of(
                    "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/cuoc-chien-vi-mach--Chris-Miller/ccvm-01.jpg",
                    "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/cuoc-chien-vi-mach--Chris-Miller/ccvm-02.jpg",
                    "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/cuoc-chien-vi-mach--Chris-Miller/ccvm-03.jpg",
                    "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/cuoc-chien-vi-mach--Chris-Miller/ccvm-04.jpg",                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/cuoc-chien-vi-mach--Chris-Miller/ccvm-05.jpg",
                    "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/cuoc-chien-vi-mach--Chris-Miller/ccvm-06.jpg",
                    "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/cuoc-chien-vi-mach--Chris-Miller/ccvm-07.jpg",
                    "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/cuoc-chien-vi-mach--Chris-Miller/ccvm-08.jpg"
                ))
                .status(Product.ProductStatus.ACTIVE)
                .build();

            Product p22 = Product.builder()
                    .category(businessCat)
                    .name("Độc lập tài chính")
                    .author("Grant Sabatier")
                    .publisher("NXB Tài Chính")
                    .isbn(generateIsbn("Độc lập tài chính"))
                    .description("Kế hoạch thực tế để tăng thu nhập, tiết kiệm và hướng tới tự do tài chính.")
                    .price(new BigDecimal("189000.00"))
                    .stockQuantity(150)
                    .imageUrls(List.of(
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/doc-lap-tai-chinh--Grant-Sabatier/dltc-01.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/doc-lap-tai-chinh--Grant-Sabatier/dltc-02.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/doc-lap-tai-chinh--Grant-Sabatier/dltc-03.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/doc-lap-tai-chinh--Grant-Sabatier/dltc-04.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/doc-lap-tai-chinh--Grant-Sabatier/dltc-05.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/doc-lap-tai-chinh--Grant-Sabatier/dltc-06.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/doc-lap-tai-chinh--Grant-Sabatier/dltc-07.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/doc-lap-tai-chinh--Grant-Sabatier/dltc-08.jpg"
                    ))
                    .status(Product.ProductStatus.ACTIVE)
                    .build();

            Product p23 = Product.builder()
                    .category(businessCat)
                    .name("Hàn Quốc chất lượng cao")
                    .author("Wan-Seon Shin")
                    .publisher("NXB Chính Trị Quốc Gia")
                    .isbn(generateIsbn("Hàn Quốc chất lượng cao"))
                    .description("Bài học phát triển quốc gia và nâng chuẩn chất lượng trong quản trị lẫn sản xuất.")
                    .price(new BigDecimal("205000.00"))
                    .stockQuantity(75)
                    .imageUrls(List.of(
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/han-quoc-chat-luong-cao--Wan-Seon-Shin/hqclc-01.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/han-quoc-chat-luong-cao--Wan-Seon-Shin/hqclc-02.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/han-quoc-chat-luong-cao--Wan-Seon-Shin/hqclc-03.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/han-quoc-chat-luong-cao--Wan-Seon-Shin/hqclc-04.jpg"
                    ))
                    .status(Product.ProductStatus.ACTIVE)
                    .build();

            Product p24 = Product.builder()
                    .category(businessCat)
                    .name("How Business Work")
                    .author("DK")
                    .publisher("NXB Thế Giới")
                    .isbn(generateIsbn("How Business Work"))
                    .description("Giải thích cách doanh nghiệp vận hành từ tài chính, marketing đến quản trị.")
                    .price(new BigDecimal("219000.00"))
                    .stockQuantity(120)
                    .imageUrls(List.of(
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/how-bussiness-work--DK/hbw-01.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/how-bussiness-work--DK/hbw-02.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/how-bussiness-work--DK/hbw-03.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/how-bussiness-work--DK/hbw-04.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/how-bussiness-work--DK/hbw-05.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/how-bussiness-work--DK/hbw-06.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/how-bussiness-work--DK/hbw-07.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/how-bussiness-work--DK/hbw-08.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/how-bussiness-work--DK/hbw-09.jpg"
                    ))
                    .status(Product.ProductStatus.ACTIVE)
                    .build();

            Product p25 = Product.builder()
                    .category(businessCat)
                    .name("How Politics Work")
                    .author("DK")
                    .publisher("NXB Thế Giới")
                    .isbn(generateIsbn("How Politics Work"))
                    .description("Bức tranh dễ hiểu về hệ thống chính trị, quyền lực và cơ chế vận hành nhà nước.")
                    .price(new BigDecimal("219000.00"))
                    .stockQuantity(115)
                    .imageUrls(List.of(
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/how-politics-work--DK/hpw-01.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/how-politics-work--DK/hpw-02.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/how-politics-work--DK/hpw-03.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/how-politics-work--DK/hpw-04.jpg",
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/how-politics-work--DK/hpw-05.jpg"
                    ))
                    .status(Product.ProductStatus.ACTIVE)
                    .build();

        //     Product p26 = Product.builder()
        //             .category(businessCat)
        //             .name("Kinh doanh sự lựa chọn")
        //             .author("Matthew Willcox")
        //             .publisher("NXB Lao Động")
        //             .isbn(generateIsbn("Kinh doanh sự lựa chọn"))
        //             .description("Phân tích cách khách hàng ra quyết định và doanh nghiệp có thể tác động hợp lý.")
        //             .price(new BigDecimal("179000.00"))
        //             .stockQuantity(100)
        //             .imageUrls(List.of("https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/kinh-doanh-su-lua-chon--Matthew-Willcox/kdslc-01.jpg"))
        //             .status(Product.ProductStatus.ACTIVE)
        //             .build();

        //     Product p27 = Product.builder()
        //             .category(businessCat)
        //             .name("Lịch sử tranh đoạt tài nguyên thế giới")
        //             .author("Hikaru Hinaruma")
        //             .publisher("NXB Khoa Học Kỹ Thuật")
        //             .isbn(generateIsbn("Lịch sử tranh đoạt tài nguyên thế giới"))
        //             .description("Câu chuyện dài về cạnh tranh tài nguyên, địa chính trị và quyền lực toàn cầu.")
        //             .price(new BigDecimal("239000.00"))
        //             .stockQuantity(80)
        //             .imageUrls(List.of("https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/lich-su-tranh-doat-tai-nguyen-the-gioi--Hikaru-Hinaruma/lstdtntg-01.jpg"))
        //             .status(Product.ProductStatus.ACTIVE)
        //             .build();

        //     Product p28 = Product.builder()
        //             .category(businessCat)
        //             .name("Lược sử Hoa Kỳ")
        //             .author("James West")
        //             .publisher("NXB Thế Giới")
        //             .isbn(generateIsbn("Lược sử Hoa Kỳ"))
        //             .description("Tổng quan súc tích về lịch sử hình thành và phát triển của Hoa Kỳ.")
        //             .price(new BigDecimal("209000.00"))
        //             .stockQuantity(90)
        //             .imageUrls(List.of("https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/luoc-su-hoa-ky--James-West/lshk-01.jpg"))
        //             .status(Product.ProductStatus.ACTIVE)
        //             .build();

        //     Product p29 = Product.builder()
        //             .category(businessCat)
        //             .name("Lược sử kinh tế")
        //             .author("Daniel Cohen")
        //             .publisher("NXB Tri Thức")
        //             .isbn(generateIsbn("Lược sử kinh tế"))
        //             .description("Hành trình các ý tưởng kinh tế đã định hình thế giới hiện đại.")
        //             .price(new BigDecimal("199000.00"))
        //             .stockQuantity(95)
        //             .imageUrls(List.of("https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/luoc-su-kinh-te--Daniel-Cohen/lskt-01.jpg"))
        //             .status(Product.ProductStatus.ACTIVE)
        //             .build();

        //     Product p30 = Product.builder()
        //             .category(businessCat)
        //             .name("Metropolis")
        //             .author("Ben Wilson")
        //             .publisher("NXB Thế Giới")
        //             .isbn(generateIsbn("Metropolis"))
        //             .description("Khám phá lịch sử phát triển của các đô thị và sức mạnh của thành phố.")
        //             .price(new BigDecimal("255000.00"))
        //             .stockQuantity(70)
        //             .imageUrls(List.of("https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/metropolis--Ben-Wilson/metropolis-01.jpg"))
        //             .status(Product.ProductStatus.ACTIVE)
        //             .build();

        //     Product p31 = Product.builder()
        //             .category(businessCat)
        //             .name("Phương pháp Jakarta")
        //             .author("Vincent Bevins")
        //             .publisher("NXB Chính Trị Quốc Gia")
        //             .isbn(generateIsbn("Phương pháp Jakarta"))
        //             .description("Một góc nhìn lịch sử về ảnh hưởng chính trị và các phong trào can thiệp.")
        //             .price(new BigDecimal("225000.00"))
        //             .stockQuantity(85)
        //             .imageUrls(List.of("https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/phuong-phap-jakarta--Vincent-Bevins/ppj-01.jpg"))
        //             .status(Product.ProductStatus.ACTIVE)
        //             .build();

        //     Product p32 = Product.builder()
        //             .category(businessCat)
        //             .name("Quyền lực")
        //             .author("Bertrand Russell")
        //             .publisher("NXB Tri Thức")
        //             .isbn(generateIsbn("Quyền lực"))
        //             .description("Phân tích bản chất của quyền lực và cách nó vận hành trong xã hội.")
        //             .price(new BigDecimal("159000.00"))
        //             .stockQuantity(130)
        //             .imageUrls(List.of("https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/quyen-luc--Bertrand-Russell/ql-01.jpg"))
        //             .status(Product.ProductStatus.ACTIVE)
        //             .build();

        //     Product p33 = Product.builder()
        //             .category(businessCat)
        //             .name("Tại sao các đế quốc sụp đổ")
        //             .author("Peter Heather, John Rapley")
        //             .publisher("NXB Thế Giới")
        //             .isbn(generateIsbn("Tại sao các đế quốc sụp đổ"))
        //             .description("Lý giải vì sao những đế chế lớn suy tàn dưới áp lực kinh tế và chính trị.")
        //             .price(new BigDecimal("245000.00"))
        //             .stockQuantity(75)
        //             .imageUrls(List.of("https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/tai-sao-cac-de-quoc-sup-do--Peter-Heather--John-Rapley/tscdqsd-01.jpg"))
        //             .status(Product.ProductStatus.ACTIVE)
        //             .build();

        //     Product p34 = Product.builder()
        //             .category(businessCat)
        //             .name("Tiền bạc và nguy cơ khoa học")
        //             .author("David Michaels")
        //             .publisher("NXB Khoa Học Kỹ Thuật")
        //             .isbn(generateIsbn("Tiền bạc và nguy cơ khoa học"))
        //             .description("Cảnh báo về việc tiền bạc có thể làm lệch hướng các kết luận khoa học.")
        //             .price(new BigDecimal("215000.00"))
        //             .stockQuantity(100)
        //             .imageUrls(List.of("https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/tien-ban-va-nguy-khoa-hoc--David-Michaels/tbvnkh-01.jpg"))
        //             .status(Product.ProductStatus.ACTIVE)
        //             .build();

            productRepository.saveAll(List.of(
                    p1, p2, p3, p4, p5, p6, p7, p8, p9, p10,
                    p11, p12, p13, p14, p15, p16, p17, p18, p19, p20,
                    p21, p22, p23, p24, p25
                    // p26, p27, p28, p29, p30,
                    //p31, p32, p33, p34
            ));
        }
    }

    private void seedCoupons() {
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
    }

    private String generateIsbn(String productName) {
        return initials(productName) + "-" + String.format(Locale.ROOT, "%05d", RANDOM.nextInt(100000));
    }

    private String initials(String text) {
        String normalized = Normalizer.normalize(text, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+|-+$", "");

        StringBuilder builder = new StringBuilder();
        for (String token : normalized.split("-")) {
            if (!token.isBlank()) {
                builder.append(token.charAt(0));
            }
        }
        return builder.toString();
    }
}
