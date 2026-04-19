package com.workshop.customer.repository;

import com.workshop.customer.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Optional<Customer> findByPhone(String phone);

    Optional<Customer> findByLicense(String license);

    Optional<Customer> findByCustomerId(String customerId);

    // Get the highest numeric suffix to auto-generate next customer ID
    @Query("SELECT MAX(CAST(SUBSTRING(c.customerId, 6) AS int)) FROM Customer c WHERE c.customerId LIKE 'CUST-%'")
    Optional<Integer> findMaxCustomerIdSuffix();
}