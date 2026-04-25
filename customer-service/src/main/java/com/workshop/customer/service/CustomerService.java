package com.workshop.customer.service;

import com.workshop.customer.entity.Customer;
import com.workshop.customer.repository.CustomerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
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

        }

        return repo.save(customer);
    }

    public List<Customer> search(String q) {

        List<Customer> result = new ArrayList<>();

        result.addAll(repo.findByFirstNameContainingIgnoreCase(q));
        result.addAll(repo.findByLastNameContainingIgnoreCase(q));
        result.addAll(repo.findByCityContainingIgnoreCase(q));
        result.addAll(repo.findByEmailContainingIgnoreCase(q));

        repo.findByPhone(q).ifPresent(result::add);
        repo.findByCustomerId(q).ifPresent(result::add);

        return result.stream().distinct().toList();
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }

    public Long count() {
        return repo.count();
    }
}