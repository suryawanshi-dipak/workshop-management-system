package com.workshop.planning.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.workshop.planning.entity.PlanningLine;

@Repository
public interface PlanningLineRepository extends JpaRepository<PlanningLine, Long>{
    
}
