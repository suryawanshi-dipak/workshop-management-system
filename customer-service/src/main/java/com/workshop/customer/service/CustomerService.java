package com.workshop.customer.service;

import com.workshop.customer.entity.Customer;
import com.workshop.customer.repository.CustomerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CustomerService {

    private final CustomerRepository repo;

    public CustomerService(CustomerRepository repo) {
        this.repo = repo;
    }

    public List<Customer> findAll() {
        return repo.findAll();
    }

    public Optional<Customer> findById(Long id) {
        return repo.findById(id);
    }

    public Customer save(Customer customer) {
        // Basic validation
        if (customer.getName() == null || customer.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Customer name is required");
        }
        if (customer.getPhone() == null || customer.getPhone().trim().isEmpty()) {
            throw new IllegalArgumentException("Customer phone is required");
        }

        // Check for duplicate phone (when creating new or updating to different phone)
        if (customer.getId() == null) {
            // New customer
            if (repo.findByPhone(customer.getPhone()).isPresent()) {
                throw new IllegalArgumentException("Phone number already exists");
            }
            if (customer.getLicense() != null && !customer.getLicense().trim().isEmpty()) {
                if (repo.findByLicense(customer.getLicense()).isPresent()) {
                    throw new IllegalArgumentException("License number already exists");
                }
            }
        } else {
            // Updating existing customer
            Optional<Customer> existingByPhone = repo.findByPhone(customer.getPhone());
            if (existingByPhone.isPresent() && !existingByPhone.get().getId().equals(customer.getId())) {
                throw new IllegalArgumentException("Phone number already exists");
            }

            if (customer.getLicense() != null && !customer.getLicense().trim().isEmpty()) {
                Optional<Customer> existingByLicense = repo.findByLicense(customer.getLicense());
                if (existingByLicense.isPresent() && !existingByLicense.get().getId().equals(customer.getId())) {
                    throw new IllegalArgumentException("License number already exists");
                }
            }
        }

        return repo.save(customer);
    }

    public Optional<Customer> search(String phone, String license) {
        if (phone != null && !phone.trim().isEmpty()) {
            return repo.findByPhone(phone.trim());
        }

        if (license != null && !license.trim().isEmpty()) {
            return repo.findByLicense(license.trim());
        }

        return Optional.empty();
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}