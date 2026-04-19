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
        if (customer.getFirstName() == null || customer.getFirstName().trim().isEmpty()) {
            throw new IllegalArgumentException("First name is required");
        }
        if (customer.getLastName() == null || customer.getLastName().trim().isEmpty()) {
            throw new IllegalArgumentException("Last name is required");
        }
        if (customer.getPhone() == null || customer.getPhone().trim().isEmpty()) {
            throw new IllegalArgumentException("Customer phone is required");
        }

        if (customer.getId() == null) {
            // --- NEW CUSTOMER ---

            // Auto-generate customerId: CUST-001, CUST-002, ...
            int nextSuffix = repo.findMaxCustomerIdSuffix()
                    .map(max -> max + 1)
                    .orElse(1);
            customer.setCustomerId(String.format("CUST-%03d", nextSuffix));

            // Duplicate phone check
            if (repo.findByPhone(customer.getPhone()).isPresent()) {
                throw new IllegalArgumentException("Phone number already exists");
            }

            // Duplicate license check
            if (customer.getLicense() != null && !customer.getLicense().trim().isEmpty()) {
                if (repo.findByLicense(customer.getLicense()).isPresent()) {
                    throw new IllegalArgumentException("License number already exists");
                }
            }
        } else {
            // --- UPDATE EXISTING CUSTOMER ---

            // Keep the existing customerId unchanged
            repo.findById(customer.getId()).ifPresent(existing ->
                customer.setCustomerId(existing.getCustomerId())
            );

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