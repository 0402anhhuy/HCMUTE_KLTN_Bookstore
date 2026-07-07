package com.kltn.bookstore_be.catalog.infrastructure;

import com.kltn.bookstore_be.identity.domain.*;
import com.kltn.bookstore_be.catalog.domain.*;
import com.kltn.bookstore_be.ordering.domain.*;
import com.kltn.bookstore_be.payment.domain.*;
import com.kltn.bookstore_be.review.domain.*;
import com.kltn.bookstore_be.notification.domain.*;
import com.kltn.bookstore_be.audit.domain.*;
import com.kltn.bookstore_be.identity.application.*;
import com.kltn.bookstore_be.catalog.application.*;
import com.kltn.bookstore_be.ordering.application.*;
import com.kltn.bookstore_be.payment.application.*;
import com.kltn.bookstore_be.review.application.*;
import com.kltn.bookstore_be.notification.application.*;
import com.kltn.bookstore_be.audit.application.*;
import com.kltn.bookstore_be.identity.infrastructure.*;
import com.kltn.bookstore_be.payment.infrastructure.*;
import com.kltn.bookstore_be.common.*;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

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

        if (productRepository.count() < 4) {
            System.out.println("===> Seeding Products and Categories...");
            // 2. Seed Categories and Products
            productRepository.deleteAll();
            categoryRepository.deleteAll();

            Category fictionCat = Category.builder().name("Tiểu thuyết").build();
            Category techCat = Category.builder().name("Sách công nghệ").build();
            Category artCat = Category.builder().name("Sách nghệ thuật").build();
            Category psychologyCat = Category.builder().name("Sách tâm lý").build();
            categoryRepository.save(fictionCat);
            categoryRepository.save(techCat);
            categoryRepository.save(artCat);
            categoryRepository.save(psychologyCat);

            // 3. Seed Products
            Product p1 = Product.builder()
                    .category(fictionCat)
                    .name("Mật ngữ cuộc đời")
                    .author("Patrick Thorne")
                    .publisher("NXB Trẻ")
                    .isbn("9786049764512")
                    .description("Khám phá những bí ẩn sâu xa của số phận và các mối quan hệ con người qua góc nhìn tâm lý học sâu sắc.")
                    .price(new BigDecimal("168000.00"))
                    .stockQuantity(100)
                    .imageUrl("/src/assets/mat_ngu_cuoc_doi.png")
                    .status(Product.ProductStatus.ACTIVE)
                    .build();
            productRepository.save(p1);

            Product p2 = Product.builder()
                    .category(fictionCat)
                    .name("Khoa học về lòng tin")
                    .author("Arthur Clin")
                    .publisher("NXB Tổng Hợp")
                    .isbn("9780132350884")
                    .description("Phân tích cơ chế tâm lý hình thành và duy trì sự tin tưởng trong xã hội hiện đại.")
                    .price(new BigDecimal("199000.00"))
                    .stockQuantity(100)
                    .imageUrl("/src/assets/long_tin.png")
                    .status(Product.ProductStatus.ACTIVE)
                    .build();
            productRepository.save(p2);

            Product p3 = Product.builder()
                    .category(artCat)
                    .name("Bộ sách Nghệ thuật vẽ khoa học")
                    .author("Dr. Sarah James")
                    .publisher("NXB Mỹ Thuật")
                    .isbn("9786042183592")
                    .description("Hướng dẫn chi tiết từ căn bản đến nâng cao về kỹ thuật phác họa và sử dụng màu sắc trong hội họa hiện đại.")
                    .price(new BigDecimal("272000.00"))
                    .stockQuantity(100)
                    .imageUrl("/src/assets/nghe_thuat_ve.png")
                    .status(Product.ProductStatus.ACTIVE)
                    .build();
            productRepository.save(p3);

            Product p4 = Product.builder()
                    .category(psychologyCat)
                    .name("Năng lực quản lý cảm xúc")
                    .author("Clin McAvoy")
                    .publisher("NXB Lao Động")
                    .isbn("9786045678912")
                    .description("Giúp bạn làm chủ cảm xúc bản thân, cải thiện kỹ năng giao tiếp và cân bằng cuộc sống.")
                    .price(new BigDecimal("195000.00"))
                    .stockQuantity(100)
                    .imageUrl("/src/assets/quan_ly_cam_xuc.png")
                    .status(Product.ProductStatus.ACTIVE)
                    .build();
            productRepository.save(p4);
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
