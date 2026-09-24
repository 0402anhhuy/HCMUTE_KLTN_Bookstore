package com.kltn.bookstore_be.catalog.application;

import com.kltn.bookstore_be.audit.application.AuditLogService;
import com.kltn.bookstore_be.catalog.domain.*;
import com.kltn.bookstore_be.identity.domain.User;
import com.kltn.bookstore_be.notification.application.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @InjectMocks
    private ProductService productService;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private StockMovementRepository stockMovementRepository;

    @Mock
    private AuditLogService auditLogService;

    @Mock
    private NotificationService notificationService;

    private Category sampleCategory;
    private Product sampleProduct;
    private User managerUser;

    @BeforeEach
    void setUp() {
        sampleCategory = Category.builder()
                .id(1L)
                .name("Văn học")
                .build();

        sampleProduct = Product.builder()
                .id(1L)
                .name("Doraemon Tập 1")
                .author("Fujiko F. Fujio")
                .publisher("NXB Kim Đồng")
                .isbn("978-604-123-456-7")
                .description("Truyện tranh Doraemon tập 1")
                .price(BigDecimal.valueOf(25000))
                .stockQuantity(100)
                .imageUrls(List.of(
                        "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/am-muu-cau-ket--Luke-Harding/amck-01.jpg"))
                .status(Product.ProductStatus.ACTIVE)
                .category(sampleCategory)
                .build();

        managerUser = User.builder()
                .id(10L)
                .fullName("Manager")
                .email("manager@example.com")
                .role(User.Role.MANAGER)
                .status(User.UserStatus.ACTIVE)
                .build();
    }

    @Nested
    @DisplayName("Guest - Tìm kiếm và xem sản phẩm")
    class GuestProductTests {

        @Test
        @DisplayName("Xem chi tiết sản phẩm theo ID thành công")
        void getProductById_existingId_returnsProduct() {
            when(productRepository.findById(1L)).thenReturn(Optional.of(sampleProduct));

            Product result = productService.getProductById(1L);

            assertNotNull(result);
            assertEquals("Doraemon Tập 1", result.getName());
            assertEquals(BigDecimal.valueOf(25000), result.getPrice());
        }

        @Test
        @DisplayName("Xem chi tiết sản phẩm với ID không tồn tại - ném exception")
        void getProductById_nonExistingId_throwsException() {
            when(productRepository.findById(999L)).thenReturn(Optional.empty());

            RuntimeException exception = assertThrows(RuntimeException.class, () -> {
                productService.getProductById(999L);
            });

            assertTrue(exception.getMessage().contains("Không tìm thấy sản phẩm"));
        }

        @Test
        @DisplayName("Tìm kiếm sản phẩm theo từ khóa, danh mục, ngôn ngữ và khoảng giá")
        void searchProducts_withLanguageFilter_callsRepository() {
            org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(0, 10);
            org.springframework.data.domain.Page<Product> page = new org.springframework.data.domain.PageImpl<>(
                    List.of(sampleProduct));
            when(categoryRepository.findByParentCategoryId(1L)).thenReturn(List.of());
            when(productRepository.searchProducts(eq("Doraemon"), any(), eq("Tiếng Việt"), any(), any(), eq(pageable)))
                    .thenReturn(page);

            org.springframework.data.domain.Page<Product> result = productService.searchProducts("Doraemon", 1L,
                    "Tiếng Việt", BigDecimal.ZERO, BigDecimal.valueOf(50000), pageable);

            assertNotNull(result);
            assertEquals(1, result.getTotalElements());
            verify(productRepository).searchProducts(eq("Doraemon"), any(), eq("Tiếng Việt"), any(), any(),
                    eq(pageable));
        }

        @Test
        @DisplayName("Lấy tất cả danh mục sản phẩm")
        void getAllCategories_returnsCategoryList() {
            Category cat2 = Category.builder().id(2L).name("Khoa học").build();
            when(categoryRepository.findAll()).thenReturn(List.of(sampleCategory, cat2));

            List<Category> result = productService.getAllCategories();

            assertEquals(2, result.size());
            assertEquals("Văn học", result.get(0).getName());
            assertEquals("Khoa học", result.get(1).getName());
        }
    }

    @Nested
    @DisplayName("Manager - Quản lý danh mục")
    class CategoryManagementTests {

        @Test
        @DisplayName("Tạo danh mục mới thành công")
        void createCategory_newName_success() {
            when(categoryRepository.findByName("Kinh tế")).thenReturn(Optional.empty());
            Category newCategory = Category.builder().id(3L).name("Kinh tế").build();
            when(categoryRepository.save(any(Category.class))).thenReturn(newCategory);

            Category result = productService.createCategory("Kinh tế");

            assertEquals("Kinh tế", result.getName());
            verify(categoryRepository).save(any(Category.class));
        }

        @Test
        @DisplayName("Tạo danh mục đã tồn tại - ném exception")
        void createCategory_existingName_throwsException() {
            when(categoryRepository.findByName("Văn học")).thenReturn(Optional.of(sampleCategory));

            RuntimeException exception = assertThrows(RuntimeException.class, () -> {
                productService.createCategory("Văn học");
            });

            assertEquals("Danh mục đã tồn tại", exception.getMessage());
        }
    }

    @Nested
    @DisplayName("Manager - Quản lý sản phẩm")
    class ProductManagementTests {

        @Test
        @DisplayName("Tạo sản phẩm mới với trạng thái ACTIVE - gửi thông báo cho admin/manager")
        void createProduct_activeStatus_notifiesManagersAndAdmins() {
            Product newProduct = Product.builder()
                    .name("Sách mới")
                    .price(BigDecimal.valueOf(50000))
                    .stockQuantity(50)
                    .status(Product.ProductStatus.ACTIVE)
                    .build();

            when(categoryRepository.findById(1L)).thenReturn(Optional.of(sampleCategory));
            when(productRepository.save(any(Product.class))).thenAnswer(invocation -> {
                Product p = invocation.getArgument(0);
                p.setId(2L);
                return p;
            });

            Product result = productService.createProduct(newProduct, 1L);

            assertNotNull(result);
            assertEquals(sampleCategory, result.getCategory());
            verify(notificationService).notifyManagersAndAdmins(anyString(), anyString(), any(), any(), any());
        }

        @Test
        @DisplayName("Tạo sản phẩm với danh mục không tồn tại - ném exception")
        void createProduct_invalidCategory_throwsException() {
            when(categoryRepository.findById(999L)).thenReturn(Optional.empty());

            assertThrows(RuntimeException.class, () -> {
                productService.createProduct(sampleProduct, 999L);
            });
        }

        @Test
        @DisplayName("Cập nhật sản phẩm thành công với danh mục mới")
        void updateProduct_withCategory_success() {
            Category newCategory = Category.builder().id(2L).name("Khoa học").build();
            Product updatedDetails = Product.builder()
                    .name("Doraemon Tập 1 - Tái bản")
                    .author("Fujiko F. Fujio")
                    .publisher("NXB Kim Đồng")
                    .isbn("978-604-123-456-8")
                    .description("Tái bản 2026")
                    .price(BigDecimal.valueOf(30000))
                    .stockQuantity(200)
                    .imageUrls(List.of(
                            "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/am-muu-cau-ket--Luke-Harding/amck-01.jpg"))
                    .status(Product.ProductStatus.ACTIVE)
                    .build();

            when(productRepository.findById(1L)).thenReturn(Optional.of(sampleProduct));
            when(categoryRepository.findById(2L)).thenReturn(Optional.of(newCategory));
            when(productRepository.save(any(Product.class))).thenReturn(sampleProduct);

            Product result = productService.updateProduct(1L, updatedDetails, 2L);

            assertEquals("Doraemon Tập 1 - Tái bản", sampleProduct.getName());
            assertEquals(BigDecimal.valueOf(30000), sampleProduct.getPrice());
            assertEquals(newCategory, sampleProduct.getCategory());
        }

        @Test
        @DisplayName("Cập nhật sản phẩm từ INACTIVE sang ACTIVE - gửi thông báo")
        void updateProduct_activateProduct_sendsNotification() {
            sampleProduct.setStatus(Product.ProductStatus.INACTIVE);

            Product updatedDetails = Product.builder()
                    .name("Doraemon Tập 1")
                    .author("Fujiko F. Fujio")
                    .publisher("NXB Kim Đồng")
                    .isbn("978-604-123-456-7")
                    .description("Mô tả")
                    .price(BigDecimal.valueOf(25000))
                    .stockQuantity(100)
                    .imageUrls(List.of(
                            "https://res.cloudinary.com/diwo0fi2c/image/upload/bookstore-products/kinh-te-chinh-tri/am-muu-cau-ket--Luke-Harding/amck-01.jpg"))
                    .status(Product.ProductStatus.ACTIVE)
                    .build();

            when(productRepository.findById(1L)).thenReturn(Optional.of(sampleProduct));
            when(productRepository.save(any(Product.class))).thenReturn(sampleProduct);

            productService.updateProduct(1L, updatedDetails);

            verify(notificationService).notifyManagersAndAdmins(anyString(), anyString(), any(), any(), any());
        }

        @Test
        @DisplayName("Xóa sản phẩm thành công")
        void deleteProduct_existingId_success() {
            productService.deleteProduct(1L);

            verify(productRepository).deleteById(1L);
        }
    }

    @Nested
    @DisplayName("Manager - Quản lý tồn kho")
    class StockManagementTests {

        @Test
        @DisplayName("Nhập kho (IMPORT) - tăng số lượng tồn kho")
        void adjustStock_import_increasesStock() {
            when(productRepository.findById(1L)).thenReturn(Optional.of(sampleProduct));
            when(productRepository.save(any(Product.class))).thenReturn(sampleProduct);
            when(stockMovementRepository.save(any(StockMovement.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            productService.adjustStock(1L, 50, StockMovement.MovementType.IMPORT, "Nhập hàng mới", managerUser);

            assertEquals(150, sampleProduct.getStockQuantity());
            verify(stockMovementRepository).save(any(StockMovement.class));
            verify(auditLogService).log(eq(managerUser), eq("STOCK_MOVEMENT"), anyString());
        }

        @Test
        @DisplayName("Xuất kho (EXPORT) thành công - giảm số lượng tồn kho")
        void adjustStock_export_decreasesStock() {
            when(productRepository.findById(1L)).thenReturn(Optional.of(sampleProduct));
            when(productRepository.save(any(Product.class))).thenReturn(sampleProduct);
            when(stockMovementRepository.save(any(StockMovement.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            productService.adjustStock(1L, 30, StockMovement.MovementType.EXPORT, "Xuất hàng", managerUser);

            assertEquals(70, sampleProduct.getStockQuantity());
        }

        @Test
        @DisplayName("Xuất kho vượt quá tồn kho - ném exception")
        void adjustStock_exportExceedsStock_throwsException() {
            when(productRepository.findById(1L)).thenReturn(Optional.of(sampleProduct));

            RuntimeException exception = assertThrows(RuntimeException.class, () -> {
                productService.adjustStock(1L, 150, StockMovement.MovementType.EXPORT, "Xuất quá nhiều", managerUser);
            });

            assertEquals("Số lượng tồn kho không đủ để xuất", exception.getMessage());
        }

        @Test
        @DisplayName("Điều chỉnh tồn kho (ADJUST) - đặt lại số lượng chính xác")
        void adjustStock_adjust_setsExactQuantity() {
            when(productRepository.findById(1L)).thenReturn(Optional.of(sampleProduct));
            when(productRepository.save(any(Product.class))).thenReturn(sampleProduct);
            when(stockMovementRepository.save(any(StockMovement.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            productService.adjustStock(1L, 75, StockMovement.MovementType.ADJUST, "Kiểm kê", managerUser);

            assertEquals(75, sampleProduct.getStockQuantity());
        }
    }
}
