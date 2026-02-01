package com.workshop.planning.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.workshop.planning.entity.Planning;

@Repository
public interface PlanningRepository extends JpaRepository<Planning, Long>{

}
