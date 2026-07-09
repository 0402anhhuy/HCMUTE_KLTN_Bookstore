package com.kltn.bookstore_be.service;

import com.kltn.bookstore_be.entity.Shipper;
import com.kltn.bookstore_be.repository.ShipperRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ShipperService {

    private final ShipperRepository shipperRepository;

    public List<Shipper> findAll() {
        return shipperRepository.findAll();
    }

    public Page<Shipper> findAll(Pageable pageable) {
        return shipperRepository.findAll(pageable);
    }

    public Shipper findById(Long id) {
        return shipperRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy shipper với ID: " + id));
    }

    @Transactional
    public Shipper save(Shipper shipper) {
        return shipperRepository.save(shipper);
    }

    @Transactional
    public void deleteById(Long id) {
        shipperRepository.deleteById(id);
    }
}
