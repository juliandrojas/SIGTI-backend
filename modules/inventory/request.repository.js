import pool from "../../config/db.js";
import { validateInventoryRequest } from "./request.validation.js";

const select = `SELECT r.*, i.name AS item_name, i.available_quantity FROM inventory_requests r JOIN inventory_items i ON i.id=r.item_id`;
export const createRequest = async (payload, userId) => {
  const p = validateInventoryRequest(payload);
  const user = await pool.query("SELECT name, lastname FROM users WHERE id=$1", [userId]);
  if (!user.rows[0]) throw new Error("Usuario no encontrado.");
  const name = [user.rows[0].name, user.rows[0].lastname].filter(Boolean).join(" ");
  const result = await pool.query(`INSERT INTO inventory_requests (item_id,requester_id,requested_by,position,quantity,request_type,expected_return_datetime,notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`, [p.item_id,userId,name,p.position.trim(),p.quantity,p.request_type,p.expected_return_datetime||null,p.notes||null]);
  return result.rows[0];
};
export const getMyRequests = async (userId) => (await pool.query(`${select} WHERE r.requester_id=$1 ORDER BY r.created_at DESC`,[userId])).rows;
export const getAllRequests = async () => (await pool.query(`${select} ORDER BY r.created_at DESC`)).rows;
export const deliverRequest = async (id, reviewerId, previousReceived=false) => {
 const client=await pool.connect(); try { await client.query("BEGIN"); const r=await client.query(`${select} WHERE r.id=$1 FOR UPDATE`,[id]); const req=r.rows[0]; if(!req||req.status!=="pending") throw new Error("La solicitud no está pendiente."); if(req.request_type==="permanent_replacement"&&!previousReceived) throw new Error("Debes confirmar la recepción del componente anterior."); if(req.quantity>Number(req.available_quantity)) throw new Error("No hay existencias suficientes."); await client.query("UPDATE inventory_items SET available_quantity=available_quantity-$1,status=CASE WHEN available_quantity-$1<=0 THEN 'loaned' ELSE 'available' END,updated_at=NOW() WHERE id=$2",[req.quantity,req.item_id]); const out=await client.query("UPDATE inventory_requests SET status='delivered',previous_component_received=$1,reviewed_by=$2,reviewed_at=NOW(),updated_at=NOW() WHERE id=$3 RETURNING *",[previousReceived,reviewerId,id]); await client.query("COMMIT"); return out.rows[0]; } catch(e){await client.query("ROLLBACK");throw e;} finally{client.release();}
};
export const rejectRequest = async(id, reviewerId, reason) => (await pool.query("UPDATE inventory_requests SET status='rejected',reviewed_by=$1,reviewed_at=NOW(),rejection_reason=$2,updated_at=NOW() WHERE id=$3 AND status='pending' RETURNING *",[reviewerId,reason||null,id])).rows[0];
export const returnRequest = async(id, reviewerId) => { const c=await pool.connect(); try {await c.query("BEGIN"); const r=await c.query(`${select} WHERE r.id=$1 FOR UPDATE`,[id]); const q=r.rows[0]; if(!q||q.status!=="delivered"||q.request_type!=="temporary_loan") throw new Error("Solo se pueden devolver préstamos temporales entregados."); await c.query("UPDATE inventory_items SET available_quantity=available_quantity+$1,status='available',updated_at=NOW() WHERE id=$2",[q.quantity,q.item_id]); const out=await c.query("UPDATE inventory_requests SET status='returned',reviewed_by=$1,reviewed_at=NOW(),updated_at=NOW() WHERE id=$2 RETURNING *",[reviewerId,id]); await c.query("COMMIT");return out.rows[0];}catch(e){await c.query("ROLLBACK");throw e;}finally{c.release();} };
